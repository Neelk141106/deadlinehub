const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegister } = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (Student or Teacher)
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      studentCode,
      department,
      semester,
      division,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('Email already exists', 409));
    }

    // Create new user (password is automatically hashed by User model pre-save hook)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role.toLowerCase().trim(),
      studentCode: studentCode ? studentCode.trim() : '',
      department: department ? department.trim() : 'Information Technology',
      semester: semester ? semester.trim() : '',
      division: division ? division.trim() : '',
    });

    await user.save();

    // Return created user without password or hash
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentCode: user.studentCode,
        department: user.department,
        semester: user.semester,
        division: user.division,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('Server configuration error: JWT_SECRET is not configured', 500));
    }

    // Generate JWT token with user id and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    // Return token and user metadata (never password or hash)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentCode: user.studentCode,
        department: user.department,
        semester: user.semester,
        division: user.division,
        createdAt: user.createdAt,
      },
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
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentCode: user.studentCode,
        department: user.department,
        semester: user.semester,
        division: user.division,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
