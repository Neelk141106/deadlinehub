const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegister } = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const { sendVerificationEmail, isEmailConfigured } = require('../services/emailService');

const router = express.Router();

/**
 * Generate a cryptographically secure 6-digit numeric OTP string.
 */
function generateSecureOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP string with SHA-256 for secure storage.
 */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Format user for public API responses.
 */
function sanitizeUser(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified !== false,
    studentCode: user.studentCode,
    department: user.department,
    semester: user.semester,
    division: user.division,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Registers user in unverified state and sends 6-digit OTP via real email delivery.
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentCode,
      department,
      semester,
      division,
    } = req.body;

    const cleanRole = (role && typeof role === 'string' && role.toLowerCase().trim() === 'teacher')
      ? 'teacher'
      : 'student';

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.isVerified !== false) {
        return next(new AppError('Email already exists', 409));
      }

      // Existing unverified account: enforce resend cooldown if requested recently
      if (existingUser.verificationOtpLastSent) {
        const elapsed = Date.now() - new Date(existingUser.verificationOtpLastSent).getTime();
        if (elapsed < 60000) {
          const secondsLeft = Math.ceil((60000 - elapsed) / 1000);
          return next(new AppError(`An unverified account already exists. Please wait ${secondsLeft}s before requesting a new code.`, 429));
        }
      }

      // Generate a fresh OTP
      const plainOtp = generateSecureOtp();
      existingUser.name = name.trim();
      existingUser.password = password; // Will be hashed by User pre-save hook
      existingUser.role = cleanRole;
      existingUser.studentCode = studentCode ? studentCode.trim() : '';
      existingUser.department = department ? department.trim() : 'Information Technology';
      existingUser.semester = semester ? semester.trim() : '';
      existingUser.division = division ? division.trim() : '';
      existingUser.isVerified = false;
      existingUser.verificationOtp = hashOtp(plainOtp);
      existingUser.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      existingUser.verificationOtpAttempts = 0;
      existingUser.verificationOtpLastSent = new Date();

      await existingUser.save();

      const emailReady = isEmailConfigured();
      if (emailReady) {
        try {
          await sendVerificationEmail({ to: existingUser.email, name: existingUser.name, otp: plainOtp });
        } catch (emailErr) {
          console.error('[Auth] Failed to send verification email:', emailErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        emailDeliveryConfigured: emailReady,
        email: existingUser.email,
        message: emailReady
          ? 'Registration received. A 6-digit verification code has been sent to your email.'
          : 'Registration received in unverified state. Email delivery is not configured on the server (SMTP_HOST, SMTP_USER, SMTP_PASS required).',
        user: sanitizeUser(existingUser),
      });
    }

    // Generate secure 6-digit OTP
    const plainOtp = generateSecureOtp();
    const hashedOtp = hashOtp(plainOtp);

    // Create new user in unverified state
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: cleanRole,
      studentCode: studentCode ? studentCode.trim() : '',
      department: department ? department.trim() : 'Information Technology',
      semester: semester ? semester.trim() : '',
      division: division ? division.trim() : '',
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verificationOtpAttempts: 0,
      verificationOtpLastSent: new Date(),
    });

    await user.save();

    const emailReady = isEmailConfigured();
    if (emailReady) {
      try {
        await sendVerificationEmail({ to: user.email, name: user.name, otp: plainOtp });
      } catch (emailErr) {
        console.error('[Auth] Failed to send verification email:', emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      emailDeliveryConfigured: emailReady,
      email: user.email,
      message: emailReady
        ? 'User registered successfully. A 6-digit verification code has been sent to your email.'
        : 'User registered in unverified state. Email delivery is not configured on the server (SMTP_HOST, SMTP_USER, SMTP_PASS required).',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP, marks account as verified, and clears OTP state.
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return next(new AppError('Please provide a valid 6-digit verification code', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next(new AppError('No account found with this email address', 404));
    }

    if (user.isVerified) {
      return next(new AppError('Account is already verified. Please log in.', 400));
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return next(new AppError('No verification code requested. Please request a new code.', 400));
    }

    if (new Date() > new Date(user.verificationOtpExpires)) {
      return next(new AppError('Verification code has expired. Please request a new code.', 400));
    }

    if (user.verificationOtpAttempts >= 5) {
      user.verificationOtp = null;
      user.verificationOtpExpires = null;
      await user.save();
      return next(new AppError('Too many incorrect verification attempts. Please request a new code.', 429));
    }

    // Verify OTP against stored SHA-256 hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== user.verificationOtp) {
      user.verificationOtpAttempts = (user.verificationOtpAttempts || 0) + 1;
      await user.save();

      const remaining = Math.max(0, 5 - user.verificationOtpAttempts);
      return next(new AppError(`Invalid verification code. ${remaining} attempt(s) remaining.`, 400));
    }

    // Verification successful: mark verified and clear OTP fields
    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    user.verificationOtpAttempts = 0;
    user.verificationOtpLastSent = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/resend-otp
 * Resends a fresh 6-digit OTP with 60-second cooldown and rate limiting.
 */
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next(new AppError('No account found with this email address', 404));
    }

    if (user.isVerified) {
      return next(new AppError('Account is already verified. Please log in.', 400));
    }

    // 60-second cooldown check
    if (user.verificationOtpLastSent) {
      const elapsed = Date.now() - new Date(user.verificationOtpLastSent).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const secondsLeft = Math.ceil((cooldownMs - elapsed) / 1000);
        return next(new AppError(`Please wait ${secondsLeft} seconds before requesting a new code.`, 429));
      }
    }

    if (!isEmailConfigured()) {
      return next(
        new AppError(
          'Email delivery service is not configured on the server. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM in server environment variables.',
          503
        )
      );
    }

    const plainOtp = generateSecureOtp();
    user.verificationOtp = hashOtp(plainOtp);
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.verificationOtpAttempts = 0;
    user.verificationOtpLastSent = new Date();

    await user.save();

    await sendVerificationEmail({ to: user.email, name: user.name, otp: plainOtp });

    res.status(200).json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT (blocks unverified accounts).
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return next(new AppError('Please provide email and password', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify password with stored bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Block unverified accounts
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in. A verification code was sent to your email.',
        unverified: true,
        email: user.email,
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('Server configuration error: JWT_SECRET is not configured', 500));
    }

    // Generate JWT token with user id, role, and verified status
    const token = jwt.sign(
      { id: user._id, role: user.role, isVerified: user.isVerified !== false },
      secret,
      { expiresIn: '1d' }
    );

    // Return token and user metadata (never password or OTP)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Protected route to get authenticated user profile
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
