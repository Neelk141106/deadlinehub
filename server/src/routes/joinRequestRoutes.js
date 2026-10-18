const express = require('express');
const mongoose = require('mongoose');
const JoinRequest = require('../models/JoinRequest');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { validateObjectId } = require('../middleware/validate');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * GET /api/join-requests
 * Retrieve join requests for the authenticated user:
 * - Teachers: requests for classes they own
 * - Students: requests they have submitted
 */
/**
 * GET /api/join-requests/history
 * Retrieve approved or rejected join requests for the authenticated user:
 * - Teachers: requests for classes they own
 * - Students: requests they have submitted
 */
router.get('/history', async (req, res, next) => {
  try {
    const filter = {};
    const userId = (req.user.id || req.user._id).toString();

    if (req.user.role === 'teacher') {
      const ownedClasses = await Class.find({ teacherId: userId }).select('_id');
      const ownedClassIds = ownedClasses.map((c) => c._id);
      filter.$or = [
        { teacherId: userId },
        { classId: { $in: ownedClassIds } },
      ];
    } else {
      filter.studentId = userId;
    }

    filter.status = { $in: ['approved', 'rejected'] };

    const requests = await JoinRequest.find(filter)
      .populate('studentId', 'name email studentCode department semester division')
      .populate('classId', 'className subject classCode division semester department')
      .populate('teacherId', 'name email department')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    const userId = (req.user.id || req.user._id).toString();

    if (req.user.role === 'teacher') {
      const ownedClasses = await Class.find({ teacherId: userId }).select('_id');
      const ownedClassIds = ownedClasses.map((c) => c._id);
      filter.$or = [
        { teacherId: userId },
        { classId: { $in: ownedClassIds } },
      ];
    } else {
      filter.studentId = userId;
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    } else if (status && status.toLowerCase() === 'history') {
      filter.status = { $in: ['approved', 'rejected'] };
    }

    const requests = await JoinRequest.find(filter)
      .populate('studentId', 'name email studentCode department semester division')
      .populate('classId', 'className subject classCode division semester department')
      .populate('teacherId', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/join-requests
 * Student submits a request to join a class
 */
router.post('/', requireRole('student'), async (req, res, next) => {
  try {
    const { classCode, classId } = req.body;

    let targetClass = null;

    if (classCode && typeof classCode === 'string') {
      targetClass = await Class.findOne({ classCode: classCode.trim().toUpperCase() });
    } else if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      targetClass = await Class.findById(classId);
    }

    if (!targetClass) {
      return next(new AppError('Class not found. Please check the class code.', 404));
    }

    // Check if student is already enrolled in the class
    const alreadyEnrolled = targetClass.students.some((sId) => sId.toString() === req.user.id);
    if (alreadyEnrolled) {
      return next(new AppError('You are already enrolled in this class', 400));
    }

    // Check for existing request
    let joinRequest = await JoinRequest.findOne({
      studentId: req.user.id,
      classId: targetClass._id,
    });

    if (joinRequest) {
      if (joinRequest.status === 'pending') {
        return next(new AppError('A join request for this class is already pending approval', 400));
      }
      // If student is not enrolled and previous request was rejected or approved (e.g. student left or was removed),
      // allow re-requesting by setting status back to pending
      joinRequest.status = 'pending';
      await joinRequest.save();
    } else {
      joinRequest = new JoinRequest({
        studentId: req.user.id,
        classId: targetClass._id,
        teacherId: targetClass.teacherId,
        status: 'pending',
      });
      await joinRequest.save();
    }

    await joinRequest.populate('studentId', 'name email studentCode department semester division');
    await joinRequest.populate('classId', 'className subject classCode division semester department');

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${targetClass.teacherId.toString()}`).emit('join-request:created', joinRequest);
      io.to(`user:${req.user.id}`).emit('join-request:created', joinRequest);
    }

    // Create notification for teacher
    const studentName = req.user.name || 'A student';
    const teacherNotification = new Notification({
      recipientId: targetClass.teacherId,
      senderId: req.user.id,
      type: 'general',
      title: `New Join Request: ${studentName}`,
      message: `${studentName} requested to join ${targetClass.className} (${targetClass.classCode}).`,
      relatedResource: 'class',
      relatedResourceId: targetClass._id,
      targetClassIds: [targetClass._id],
      isRead: false,
    });
    await teacherNotification.save();

    if (io) {
      io.to(`user:${targetClass.teacherId.toString()}`).emit('notification:new', teacherNotification);
    }

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully. Waiting for teacher approval.',
      request: joinRequest,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/join-requests/:id
 * Student cancels their own pending join request
 */
router.delete('/:id', validateObjectId, requireRole('student'), async (req, res, next) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) {
      return next(new AppError('Join request not found', 404));
    }

    if (request.studentId.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you can only cancel your own join requests', 403));
    }

    if (request.status !== 'pending') {
      return next(new AppError(`Cannot cancel a request that has already been ${request.status}`, 400));
    }

    await JoinRequest.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.teacherId.toString()}`).emit('join-request:updated', {
        _id: req.params.id,
        status: 'cancelled',
      });
      io.to(`user:${req.user.id}`).emit('join-request:updated', {
        _id: req.params.id,
        status: 'cancelled',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Join request cancelled successfully',
      requestId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/join-requests/:id/approve
 * Teacher approves a pending join request and enrolls student into the class
 */
router.patch('/:id/approve', validateObjectId, requireRole('teacher'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return next(new AppError('Join request not found', 404));
    }

    // Ownership check: Teacher can only approve requests for classes they own
    const userId = (req.user.id || req.user._id).toString();
    const isTeacherOwner = request.teacherId.toString() === userId ||
      await Class.exists({ _id: request.classId, teacherId: userId });

    if (!isTeacherOwner) {
      return next(new AppError('Forbidden: you cannot review join requests for another teacher\'s class', 403));
    }

    if (request.status !== 'pending') {
      return next(new AppError(`Cannot approve request with current status '${request.status}'`, 400));
    }

    // Find targeted class and enroll student
    const targetClass = await Class.findById(request.classId);
    if (!targetClass) {
      return next(new AppError('Associated class not found', 404));
    }

    const alreadyEnrolled = targetClass.students.some((sId) => sId.toString() === request.studentId.toString());
    if (!alreadyEnrolled) {
      targetClass.students.push(request.studentId);
      await targetClass.save();
    }

    request.status = 'approved';
    await request.save();

    await request.populate('studentId', 'name email studentCode department semester division');
    await request.populate('classId', 'className subject classCode division semester department');

    const studentIdStr = (request.studentId?._id || request.studentId).toString();
    const teacherIdStr = (request.teacherId?._id || request.teacherId).toString();

    const io = req.app.get('io');
    if (io) {
      // Auto-join any connected sockets of this student to the class room
      try {
        if (typeof io.in === 'function') {
          io.in(`user:${studentIdStr}`).socketsJoin(`class:${targetClass._id.toString()}`);
        }
      } catch (err) {
        console.warn('[Socket.IO] socketsJoin error:', err.message);
      }

      io.to(`user:${studentIdStr}`).emit('join-request:approved', request);
      io.to(`user:${teacherIdStr}`).emit('join-request:updated', request);
      io.to(`class:${targetClass._id.toString()}`).emit('class:student-joined', {
        classId: targetClass._id,
        student: request.studentId,
        className: targetClass.className,
        classCode: targetClass.classCode,
      });
      // Also emit class:student-joined directly to student room so student receives enrollment event even before joining class room
      io.to(`user:${studentIdStr}`).emit('class:student-joined', {
        classId: targetClass._id,
        classCode: targetClass.classCode,
        className: targetClass.className,
        student: request.studentId,
        class: targetClass,
      });
    }

    // Create notification for student
    const studentNotification = new Notification({
      recipientId: request.studentId,
      senderId: req.user.id,
      type: 'general',
      title: 'Join Request Approved!',
      message: `Your request to join "${targetClass.className}" has been approved by your teacher.`,
      relatedResource: 'class',
      relatedResourceId: targetClass._id,
      targetClassIds: [targetClass._id],
      isRead: false,
    });
    await studentNotification.save();

    if (io) {
      io.to(`user:${studentIdStr}`).emit('notification:new', studentNotification);
    }

    res.status(200).json({
      success: true,
      message: 'Join request approved and student enrolled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/join-requests/:id/reject
 * Teacher rejects a pending join request
 */
router.patch('/:id/reject', validateObjectId, requireRole('teacher'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return next(new AppError('Join request not found', 404));
    }

    // Ownership check: Teacher can only reject requests for classes they own
    const userId = (req.user.id || req.user._id).toString();
    const isTeacherOwner = request.teacherId.toString() === userId ||
      await Class.exists({ _id: request.classId, teacherId: userId });

    if (!isTeacherOwner) {
      return next(new AppError('Forbidden: you cannot review join requests for another teacher\'s class', 403));
    }

    if (request.status !== 'pending') {
      return next(new AppError(`Cannot reject request with current status '${request.status}'`, 400));
    }

    request.status = 'rejected';
    await request.save();

    await request.populate('studentId', 'name email studentCode department semester division');
    await request.populate('classId', 'className subject classCode division semester department');

    const targetClass = await Class.findById(request.classId);

    const studentIdStr = (request.studentId?._id || request.studentId).toString();
    const teacherIdStr = (request.teacherId?._id || request.teacherId).toString();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${studentIdStr}`).emit('join-request:rejected', request);
      io.to(`user:${teacherIdStr}`).emit('join-request:updated', request);
    }

    // Create notification for student
    const studentNotification = new Notification({
      recipientId: request.studentId,
      senderId: req.user.id,
      type: 'general',
      title: 'Join Request Update',
      message: `Your request to join "${targetClass?.className || 'the class'}" was not approved.`,
      relatedResource: 'class',
      relatedResourceId: request.classId,
      targetClassIds: [request.classId],
      isRead: false,
    });
    await studentNotification.save();

    if (io) {
      io.to(`user:${studentIdStr}`).emit('notification:new', studentNotification);
    }

    res.status(200).json({
      success: true,
      message: 'Join request rejected',
      request,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
