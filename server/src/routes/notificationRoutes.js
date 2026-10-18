const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

/**
 * GET /api/notifications
 * Retrieve notifications for the authenticated user (sorted newest first, limited)
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = { recipientId: req.user.id };
    if (req.query.unreadOnly === 'true') {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('senderId', 'name email department role')
        .populate('targetClassIds', 'className subject classCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: req.user.id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Fast endpoint to retrieve current unread notification count
 */
router.get('/unread-count', async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark an individual notification as read (strictly owned by authenticated user)
 */
router.patch('/:id/read', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Ownership check: user can only mark their own notification
    if (notification.recipientId.toString() !== req.user.id) {
      return next(new AppError('Forbidden: you cannot modify another user\'s notification', 403));
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications for the authenticated user as read
 */
router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
