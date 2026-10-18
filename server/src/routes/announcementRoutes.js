const express = require('express');
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');
const AppError = require('../utils/AppError');
const { validateObjectId, validateAnnouncement } = require('../middleware/validate');
const requireRole = require('../middleware/roleMiddleware');
const { createNotificationsForTargetClasses } = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/announcements
 * Get announcements scoped to user's role and class enrollments/ownership
 */
router.get('/', async (req, res, next) => {
  try {
    const { classId } = req.query;

    if (req.user.role === 'teacher') {
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
            // Legacy announcements created before createdBy tracking
            { createdBy: null, classId: null, targetClassIds: { $size: 0 } },
          ],
        };
      }

      const announcements = await Announcement.find(filter)
        .populate('targetClassIds', 'className subject classCode division semester')
        .populate('classId', 'className subject classCode')
        .sort({ isPinned: -1, postedAt: -1, createdAt: -1 });

      return res.status(200).json(announcements);
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

      const announcements = await Announcement.find({
        $or: [
          { targetClassIds: classId },
          { classId: classId },
          ...(teacherOwnerId ? [{ targetType: 'all_classes', createdBy: teacherOwnerId }] : []),
        ],
      })
        .populate('targetClassIds', 'className subject classCode division semester')
        .populate('classId', 'className subject classCode')
        .sort({ isPinned: -1, postedAt: -1, createdAt: -1 });

      return res.status(200).json(announcements);
    }

    // Return announcements for all classes joined by student
    const announcements = await Announcement.find({
      $or: [
        { targetClassIds: { $in: studentClassIds } },
        { classId: { $in: studentClassIds } },
        { targetType: 'all_classes', createdBy: { $in: studentTeacherIds } },
      ],
    })
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode')
      .sort({ isPinned: -1, postedAt: -1, createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/announcements
 * Create a new announcement (teacher only) with class targeting validation
 */
router.post('/', requireRole('teacher'), validateAnnouncement(false), async (req, res, next) => {
  try {
    const {
      title,
      message,
      category,
      priority,
      priorityVariant,
      priorityText,
      isPinned,
      postedBy,
      postedTime,
      postedAt,
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

      // Verify that current teacher owns EVERY targeted class
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

    const priorityVal = priority || 'Normal';
    const computedVariant = priorityVariant || priorityVal.toLowerCase();
    const computedText = priorityText || priorityVal.toUpperCase();
    const finalClassId = targetClassIds.length > 0 ? targetClassIds[0] : (classId || null);

    const announcement = new Announcement({
      title: title.trim(),
      message: message.trim(),
      category: category || 'Academic',
      priority: priorityVal,
      priorityVariant: computedVariant,
      priorityText: computedText,
      isPinned: isPinned !== undefined ? isPinned : false,
      postedBy: postedBy ? postedBy.trim() : (req.user.name || 'Teacher / Admin'),
      postedTime: postedTime || 'Just now',
      postedAt: postedAt || new Date(),
      branch: branch || 'Information Technology',
      semester: semester || 'Semester 5',
      division: division || 'All Divisions',
      classId: finalClassId,
      createdBy: req.user.id,
      targetType: targetType === 'particular_classes' ? 'particular_classes' : 'all_classes',
      targetClassIds,
    });

    const savedAnnouncement = await announcement.save();
    await savedAnnouncement.populate('targetClassIds', 'className subject classCode division semester');
    await savedAnnouncement.populate('classId', 'className subject classCode');

    // Broadcast real-time Socket.IO event to union of rooms (deduplicates delivery across rooms)
    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      targetClassIds.forEach((cId) => rooms.add(`class:${cId.toString()}`));
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('announcement:created', savedAnnouncement);
    }

    // Generate persistent in-app notifications for enrolled students in targeted classes
    await createNotificationsForTargetClasses({
      senderId: req.user.id,
      type: 'announcement_created',
      title: `New Announcement: ${savedAnnouncement.title}`,
      message: (savedAnnouncement.message || '').slice(0, 120),
      relatedResource: 'announcement',
      relatedResourceId: savedAnnouncement._id,
      targetClassIds,
      io,
    });

    res.status(201).json(savedAnnouncement);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/announcements/:id
 * Get a single announcement by ID with student authorization guard
 */
router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id)
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode');

    if (!announcement) {
      return next(new AppError('Resource not found', 404));
    }

    if (req.user.role === 'student') {
      const studentClasses = await Class.find({ students: req.user.id }).select('_id teacherId');
      const studentClassIds = studentClasses.map((c) => c._id.toString());
      const teacherIds = studentClasses.map((c) => c.teacherId?.toString()).filter(Boolean);

      const targetIds = (announcement.targetClassIds || []).map((c) => (c._id ? c._id.toString() : c.toString()));
      if (announcement.classId) {
        targetIds.push(announcement.classId._id ? announcement.classId._id.toString() : announcement.classId.toString());
      }

      const hasClassAccess = targetIds.some((cId) => studentClassIds.includes(cId));
      const hasTeacherAccess =
        announcement.targetType === 'all_classes' &&
        announcement.createdBy &&
        teacherIds.includes(announcement.createdBy.toString());

      if (!hasClassAccess && !hasTeacherAccess) {
        return next(new AppError('Forbidden: you do not have permission to view this announcement', 403));
      }
    }

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/announcements/:id
 * Update an announcement by ID (teacher owner only)
 */
router.put('/:id', validateObjectId, requireRole('teacher'), validateAnnouncement(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingAnnouncement = await Announcement.findById(id);

    if (!existingAnnouncement) {
      return next(new AppError('Resource not found', 404));
    }

    if (existingAnnouncement.createdBy && existingAnnouncement.createdBy.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only update announcements you created', 403));
    }

    const updateData = { ...req.body };

    if (updateData.priority && !updateData.priorityVariant) {
      updateData.priorityVariant = updateData.priority.toLowerCase();
    }
    if (updateData.priority && !updateData.priorityText) {
      updateData.priorityText = updateData.priority.toUpperCase();
    }

    // Process targeting changes if targetType or targetClassIds specified
    if (updateData.targetType || updateData.targetClassIds) {
      const targetType = updateData.targetType || existingAnnouncement.targetType || 'all_classes';

      if (targetType === 'particular_classes') {
        const incomingTargetClassIds = updateData.targetClassIds || existingAnnouncement.targetClassIds;
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

    updateData.createdBy = existingAnnouncement.createdBy || req.user.id;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('targetClassIds', 'className subject classCode division semester')
      .populate('classId', 'className subject classCode');

    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      const targetIds = updatedAnnouncement.targetClassIds || [];
      targetIds.forEach((c) => {
        const cId = c._id ? c._id.toString() : c.toString();
        rooms.add(`class:${cId}`);
      });
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('announcement:updated', updatedAnnouncement);
    }

    // Generate persistent in-app notifications for enrolled students
    const targetIdsForNotif = (updatedAnnouncement.targetClassIds || []).map((c) => (c._id ? c._id : c));
    await createNotificationsForTargetClasses({
      senderId: req.user.id,
      type: 'announcement_updated',
      title: `Announcement Updated: ${updatedAnnouncement.title}`,
      message: (updatedAnnouncement.message || '').slice(0, 120),
      relatedResource: 'announcement',
      relatedResourceId: updatedAnnouncement._id,
      targetClassIds: targetIdsForNotif,
      io,
    });

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/announcements/:id
 * Delete an announcement by ID (teacher owner only)
 */
router.delete('/:id', validateObjectId, requireRole('teacher'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return next(new AppError('Resource not found', 404));
    }

    if (announcement.createdBy && announcement.createdBy.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only delete announcements you created', 403));
    }

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) {
      const rooms = new Set();
      const targetIds = announcement.targetClassIds || [];
      targetIds.forEach((cId) => {
        rooms.add(`class:${cId.toString()}`);
      });
      rooms.add(`user:${req.user.id.toString()}`);
      io.to(Array.from(rooms)).emit('announcement:deleted', { _id: id });
    }

    res.status(200).json({
      message: 'Announcement deleted successfully',
      deletedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
