const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * Helper to generate a unique, clean class code (e.g. D15C-5IT or DH-X7K2)
 */
async function generateUniqueClassCode(division = '', semester = '') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const cleanDiv = (division || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
  const cleanSem = (semester || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);

  let prefix = cleanDiv || 'DH';
  let isUnique = false;
  let code = '';
  let attempts = 0;

  while (!isUnique && attempts < 15) {
    attempts++;
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (cleanDiv && cleanSem && attempts === 1) {
      // First attempt tries e.g. D15C-5IT or D15C-SEM
      code = `${cleanDiv}-${cleanSem}`;
    } else if (cleanDiv && cleanSem) {
      code = `${cleanDiv}-${cleanSem}${suffix.slice(0, 2)}`;
    } else {
      code = `${prefix}-${suffix}`;
    }

    const existing = await Class.exists({ classCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

/**
 * Validate MongoDB ObjectId middleware
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid class ID format', 400));
  }
  next();
};

/**
 * POST /api/classes
 * Teacher creates a new class
 */
router.post('/', requireRole('teacher'), async (req, res, next) => {
  try {
    const { className, subject, semester, division, classCode: customCode } = req.body;

    if (!className || typeof className !== 'string' || !className.trim()) {
      return next(new AppError('Class name is required', 400));
    }

    let finalClassCode;
    if (customCode && typeof customCode === 'string' && customCode.trim()) {
      finalClassCode = customCode.trim().toUpperCase();
      const existing = await Class.exists({ classCode: finalClassCode });
      if (existing) {
        return next(new AppError('Class code is already in use. Please use a different code or leave blank to auto-generate.', 400));
      }
    } else {
      finalClassCode = await generateUniqueClassCode(division, semester);
    }

    const newClass = new Class({
      className: className.trim(),
      subject: subject ? subject.trim() : '',
      semester: semester ? semester.trim() : '',
      division: division ? division.trim() : '',
      classCode: finalClassCode,
      teacherId: req.user.id,
      students: [],
    });

    const savedClass = await newClass.save();

    // Populate teacher info before responding
    await savedClass.populate('teacherId', 'name email department');

    // Broadcast real-time Socket.IO event if io is available
    const io = req.app.get('io');
    if (io) {
      io.emit('class:created', savedClass);
    }

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: savedClass,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/classes
 * GET /api/classes/my-classes
 * Return classes relevant to the authenticated user:
 * - Teacher: classes created by this teacher
 * - Student: classes joined by this student
 */
const getMyClassesHandler = async (req, res, next) => {
  try {
    let classes;
    if (req.user.role === 'teacher') {
      classes = await Class.find({ teacherId: req.user.id })
        .populate('students', 'name email studentCode department semester division')
        .populate('teacherId', 'name email department')
        .sort({ createdAt: -1 });
    } else {
      classes = await Class.find({ students: req.user.id })
        .populate('teacherId', 'name email department')
        .populate('students', 'name email studentCode')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    next(error);
  }
};

router.get('/my-classes', getMyClassesHandler);
router.get('/', getMyClassesHandler);

/**
 * GET /api/classes/:id
 * Retrieve class details (owner teacher or enrolled student only)
 */
router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('teacherId', 'name email department')
      .populate('students', 'name email studentCode department semester division');

    if (!classDoc) {
      return next(new AppError('Class not found', 404));
    }

    const isTeacherOwner = classDoc.teacherId && classDoc.teacherId._id.toString() === req.user.id;
    const isEnrolledStudent = classDoc.students && classDoc.students.some((s) => s._id.toString() === req.user.id);

    if (!isTeacherOwner && !isEnrolledStudent) {
      return next(new AppError('Forbidden: you do not have permission to view this class', 403));
    }

    res.status(200).json({
      success: true,
      class: classDoc,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/classes/join
 * Student joins a class using a valid class code
 */
router.post('/join', requireRole('student'), async (req, res, next) => {
  try {
    const { classCode } = req.body;

    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return next(new AppError('Please provide a valid class code', 400));
    }

    const normalizedCode = classCode.trim().toUpperCase();

    // Find class by unique code
    const targetClass = await Class.findOne({ classCode: normalizedCode });
    if (!targetClass) {
      return next(new AppError('Invalid class code. Class not found.', 404));
    }

    // Check if student already joined
    const alreadyJoined = targetClass.students.some((sId) => sId.toString() === req.user.id);
    if (alreadyJoined) {
      return next(new AppError('You have already joined this class', 400));
    }

    // Add student to class
    targetClass.students.push(req.user.id);
    await targetClass.save();

    await targetClass.populate('teacherId', 'name email department');
    await targetClass.populate('students', 'name email studentCode');

    // Retrieve joining student info for real-time notification
    const studentUser = await User.findById(req.user.id).select('name email studentCode');

    // Broadcast real-time event to connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('class:student-joined', {
        classId: targetClass._id,
        classCode: targetClass.classCode,
        className: targetClass.className,
        student: studentUser || { _id: req.user.id, name: 'Student' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully joined ${targetClass.className}`,
      class: targetClass,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/classes/:id
 * Teacher deletes their own class
 */
router.delete('/:id', validateObjectId, requireRole('teacher'), async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return next(new AppError('Class not found', 404));
    }

    if (classDoc.teacherId.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only delete classes you own', 403));
    }

    await Class.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('class:deleted', { _id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
