const express = require('express');
const mongoose = require('mongoose');
const Deadline = require('../models/Deadline');
const Class = require('../models/Class');
const AppError = require('../utils/AppError');
const { validateObjectId, validateDeadline } = require('../middleware/validate');
const requireRole = require('../middleware/roleMiddleware');
const { createNotificationsForTargetClasses } = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/deadlines
 * Get deadlines scoped to user's role and class enrollments/ownership
 */
router.get('/', async (req, res, next) => {
  try {
    const { classId } = req.query;

    if (req.user.role === 'teacher') {
      // Teacher: view deadlines they created or associated with their classes
      const teacherClasses = await Class.find({ teacherId: req.user.id }).select('_id');
      const teacherClassIds = teacherClasses.map((c) => c._id);

      let filter;
      if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          return next(new AppError('Invalid class ID format', 400));
        }
        const targetClass = await Class.findById(classId);
        const teacherOwnerId = (targetClass?.teacherId?._id || targetClass?.teacherId)?.toString();

        filter = {
          $or: [
            { targetClassIds: classId },
            { classId: classId },
            ...(teacherOwnerId ? [{ targetType: 'all_classes', createdBy: teacherOwnerId }] : []),
          ],
        };
      } else {
        filter = {
          $or: [
            { createdBy: req.user.id },
            { targetClassIds: { $in: teacherClassIds } },
            { classId: { $in: teacherClassIds } },
            // Legacy deadlines created before createdBy tracking
            { createdBy: null, classId: null, targetClassIds: { $size: 0 } },
          ],
        };
      }

      const deadlines = await Deadline.find(filter)
        .populate('targetClassIds', 'className subject classCode division semester')
        .populate('classId', 'className subject classCode')
        .sort({ dueDate: 1, createdAt: -1 });

      return res.status(200).json(deadlines);
    }

    // Role === 'student'
    const studentClasses = await Class.find({ students: req.user.id }).select('_id teacherId');
    const studentClassIds = studentClasses.map((c) => c._id);
    const studentTeacherIds = studentClasses.map((c) => c.teacherId).filter(Boolean);

    // If student has not enrolled in any class, strictly return empty array (prevent content leaks)
    if (studentClassIds.length === 0) {
      return res.status(200).json([]);
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return next(new AppError('Invalid class ID format', 400));
      }
      // Security guard: verify student is enrolled in requested class
      const isEnrolled = studentClassIds.some((id) => id.toString() === classId.toString());
      if (!isEnrolled) {
        return next(new AppError('Forbidden: you are not enrolled in this class', 403));
      }

      const targetClass = await Class.findById(classId);
      const teacherOwnerId = (targetClass?.teacherId?._id || targetClass?.teacherId)?.toString();

      const deadlines = await Deadline.find({
        $or: [
          { targetClassIds: classId },
          { classId: classId },
          ...(teacherOwnerId ? [{ targetType: 'all_classes', createdBy: teacherOwnerId }] : []),
        ],
      })
        .populate('targetClassIds', 'className subject classCode division semester')
        .populate('classId', 'className subject classCode')
        .sort({ dueDate: 1, createdAt: -1 });

      return res.status(200).json(deadlines);
    }

    // Return deadlines for all classes joined by student
    const deadlines = await Deadline.find({
      $or: [
        { targetClassIds: { $in: studentClassIds } },
        { classId: { $in: studentClassIds } },
        { targetType: 'all_classes', createdBy: { $in: studentTeacherIds } },
      ],
    })
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json(deadlines);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/deadlines
 * Create a new deadline (teacher only) with class targeting validation
 */
router.post('/', requireRole('teacher'), validateDeadline(false), async (req, res, next) => {
  try {
    const {
      title,
      subject,
      description,
      type,
      priority,
      dueDate,
      dueTime,
      branch,
      semester,
      division,
      targetType = 'all_classes',
      targetClassIds: incomingTargetClassIds,
      classId,
    } = req.body;

    let targetClassIds = [];

    if (targetType === 'particular_classes') {
      if (!incomingTargetClassIds || !Array.isArray(incomingTargetClassIds) || incomingTargetClassIds.length === 0) {
        return next(new AppError('Please select at least one class for targeting', 400));
      }

      // Validate all IDs
      for (const id of incomingTargetClassIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return next(new AppError(`Invalid class ID format: ${id}`, 400));
        }
      }

      // Verify that current teacher owns EVERY targeted class (prevent cross-teacher privilege escalation)
      const ownedClasses = await Class.find({
        _id: { $in: incomingTargetClassIds },
        teacherId: req.user.id,
      }).select('_id');

      if (ownedClasses.length !== incomingTargetClassIds.length) {
        return next(new AppError('Forbidden: you can only target classes that you own', 403));
      }

      targetClassIds = incomingTargetClassIds;
    } else {
      // 'all_classes' — targets all classes owned by this teacher
      const teacherClasses = await Class.find({ teacherId: req.user.id }).select('_id');
      targetClassIds = teacherClasses.map((c) => c._id);
    }

    const finalClassId = targetClassIds.length > 0 ? targetClassIds[0] : (classId || null);

    const deadline = new Deadline({
      title: title.trim(),
      subject: subject ? subject.trim() : '',
      description: description ? description.trim() : '',
      type: type || 'Assignment',
      priority: priority || 'Normal',
      dueDate,
      dueTime: dueTime || '23:59',
      branch: branch || 'Information Technology',
      semester: semester || 'Semester 5',
      division: division || 'All Divisions',
      classId: finalClassId,
      createdBy: req.user.id,
      targetType: targetType === 'particular_classes' ? 'particular_classes' : 'all_classes',
      targetClassIds,
    });

    const savedDeadline = await deadline.save();
    await savedDeadline.populate('targetClassIds', 'className subject classCode division semester');
    await savedDeadline.populate('classId', 'className subject classCode');

    // Broadcast real-time Socket.IO event to union of rooms (deduplicates delivery across rooms)
    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      targetClassIds.forEach((cId) => rooms.add(`class:${cId.toString()}`));
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('deadline:created', savedDeadline);
    }

    // Generate persistent in-app notifications for enrolled students in targeted classes
    const dueFormatted = savedDeadline.dueDate
      ? new Date(savedDeadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    const dueTimeFormatted = savedDeadline.dueTime ? ` at ${savedDeadline.dueTime}` : '';

    await createNotificationsForTargetClasses({
      senderId: req.user.id,
      type: 'deadline_created',
      title: `New Deadline: ${savedDeadline.title}`,
      message: `Due ${dueFormatted}${dueTimeFormatted} for ${savedDeadline.subject || 'your class'}.`,
      relatedResource: 'deadline',
      relatedResourceId: savedDeadline._id,
      targetClassIds,
      io,
    });

    res.status(201).json(savedDeadline);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/deadlines/:id
 * Get a single deadline by ID with student authorization guard
 */
router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deadline = await Deadline.findById(id)
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode');

    if (!deadline) {
      return next(new AppError('Resource not found', 404));
    }

    if (req.user.role === 'student') {
      const studentClasses = await Class.find({ students: req.user.id }).select('_id teacherId');
      const studentClassIds = studentClasses.map((c) => c._id.toString());
      const teacherIds = studentClasses.map((c) => c.teacherId?.toString()).filter(Boolean);

      const targetIds = (deadline.targetClassIds || []).map((c) => (c._id ? c._id.toString() : c.toString()));
      if (deadline.classId) {
        targetIds.push(deadline.classId._id ? deadline.classId._id.toString() : deadline.classId.toString());
      }

      const hasClassAccess = targetIds.some((cId) => studentClassIds.includes(cId));
      const hasTeacherAccess =
        deadline.targetType === 'all_classes' &&
        deadline.createdBy &&
        teacherIds.includes(deadline.createdBy.toString());

      if (!hasClassAccess && !hasTeacherAccess) {
        return next(new AppError('Forbidden: you do not have permission to view this deadline', 403));
      }
    }

    res.status(200).json(deadline);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/deadlines/:id
 * Update a deadline by ID (teacher owner only)
 */
router.put('/:id', validateObjectId, requireRole('teacher'), validateDeadline(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingDeadline = await Deadline.findById(id);

    if (!existingDeadline) {
      return next(new AppError('Resource not found', 404));
    }

    // Authorization check: teacher can only edit their own deadlines
    if (existingDeadline.createdBy && existingDeadline.createdBy.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only update deadlines you created', 403));
    }

    const updateData = { ...req.body };

    // Process targeting changes if targetType or targetClassIds specified
    if (updateData.targetType || updateData.targetClassIds) {
      const targetType = updateData.targetType || existingDeadline.targetType || 'all_classes';

      if (targetType === 'particular_classes') {
        const incomingTargetClassIds = updateData.targetClassIds || existingDeadline.targetClassIds;
        if (!incomingTargetClassIds || !Array.isArray(incomingTargetClassIds) || incomingTargetClassIds.length === 0) {
          return next(new AppError('Please select at least one class for targeting', 400));
        }

        for (const cId of incomingTargetClassIds) {
          if (!mongoose.Types.ObjectId.isValid(cId)) {
            return next(new AppError(`Invalid class ID format: ${cId}`, 400));
          }
        }

        const ownedClasses = await Class.find({
          _id: { $in: incomingTargetClassIds },
          teacherId: req.user.id,
        }).select('_id');

        if (ownedClasses.length !== incomingTargetClassIds.length) {
          return next(new AppError('Forbidden: you can only target classes that you own', 403));
        }

        updateData.targetClassIds = incomingTargetClassIds;
        updateData.targetType = 'particular_classes';
        updateData.classId = incomingTargetClassIds[0];
      } else {
        const teacherClasses = await Class.find({ teacherId: req.user.id }).select('_id');
        updateData.targetClassIds = teacherClasses.map((c) => c._id);
        updateData.targetType = 'all_classes';
        updateData.classId = updateData.targetClassIds.length > 0 ? updateData.targetClassIds[0] : null;
      }
    }

    // Ensure createdBy is preserved
    updateData.createdBy = existingDeadline.createdBy || req.user.id;

    const updatedDeadline = await Deadline.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode');

    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      const targetIds = updatedDeadline.targetClassIds || [];
      targetIds.forEach((c) => {
        const cId = c._id ? c._id.toString() : c.toString();
        rooms.add(`class:${cId}`);
      });
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('deadline:updated', updatedDeadline);
    }

    // Generate persistent in-app notifications for enrolled students
    const targetIdsForNotif = (updatedDeadline.targetClassIds || []).map((c) => (c._id ? c._id : c));
    await createNotificationsForTargetClasses({
      senderId: req.user.id,
      type: 'deadline_updated',
      title: `Deadline Updated: ${updatedDeadline.title}`,
      message: `Due date or details were updated for ${updatedDeadline.subject || 'your class'}.`,
      relatedResource: 'deadline',
      relatedResourceId: updatedDeadline._id,
      targetClassIds: targetIdsForNotif,
      io,
    });

    res.status(200).json(updatedDeadline);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/deadlines/:id
 * Delete a deadline by ID (teacher owner only)
 */
router.delete('/:id', validateObjectId, requireRole('teacher'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deadline = await Deadline.findById(id);

    if (!deadline) {
      return next(new AppError('Resource not found', 404));
    }

    if (deadline.createdBy && deadline.createdBy.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only delete deadlines you created', 403));
    }

    const deletedDeadline = await Deadline.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      const targetIds = deadline.targetClassIds || [];
      targetIds.forEach((cId) => {
        rooms.add(`class:${cId.toString()}`);
      });
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('deadline:deleted', { _id: id });
    }

    res.status(200).json({
      message: 'Deadline deleted successfully',
      deletedDeadline,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
