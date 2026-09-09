const express = require('express');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegister } = require('../middleware/validate');

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
