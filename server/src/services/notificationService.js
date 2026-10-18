const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Class = require('../models/Class');
const Deadline = require('../models/Deadline');

/**
 * Creates persistent notifications for all students enrolled in the target classes.
 * Deduplicates students when multiple target classes contain the same student.
 * Never notifies the sender about their own action.
 */
async function createNotificationsForTargetClasses({
  senderId,
  type,
  title,
  message,
  relatedResource,
  relatedResourceId,
  targetClassIds = [],
  io,
}) {
  try {
    if (!targetClassIds || targetClassIds.length === 0) {
      return [];
    }

    // Convert string IDs to ObjectIds
    const validClassIds = targetClassIds
      .map((id) => (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (validClassIds.length === 0) {
      return [];
    }

    // Retrieve all targeted classes with student lists
    const targetClasses = await Class.find({ _id: { $in: validClassIds } }).select('students');

    // Collect distinct enrolled students
    const recipientIdSet = new Set();
    const senderStr = senderId ? senderId.toString() : null;

    for (const cls of targetClasses) {
      if (Array.isArray(cls.students)) {
        for (const student of cls.students) {
          const sIdStr = student.toString();
          // Do not send notification to sender
          if (senderStr && sIdStr === senderStr) continue;
          recipientIdSet.add(sIdStr);
        }
      }
    }

    if (recipientIdSet.size === 0) {
      return [];
    }

    const notificationsToInsert = Array.from(recipientIdSet).map((studentId) => ({
      recipientId: new mongoose.Types.ObjectId(studentId),
      senderId: senderId ? new mongoose.Types.ObjectId(senderId) : null,
      type,
      title,
      message,
      relatedResource: relatedResource || 'deadline',
      relatedResourceId: relatedResourceId || null,
      targetClassIds: validClassIds,
      isRead: false,
    }));

    const insertedNotifications = await Notification.insertMany(notificationsToInsert);

    // Deliver via Socket.IO to individual student rooms in real time
    if (io) {
      for (const notif of insertedNotifications) {
        io.to(`user:${notif.recipientId.toString()}`).emit('notification:new', notif);
      }
    }

    return insertedNotifications;
  } catch (error) {
    console.error('[NotificationService] Error creating notifications:', error);
    return [];
  }
}

/**
 * Checks for upcoming deadlines due within the next 24 hours
 * and sends reminder notifications to enrolled students.
 * Idempotent: checks for existing 'deadline_reminder' notifications
 * so duplicates are never sent even across server restarts.
 */
async function checkUpcomingDeadlineReminders(io) {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find deadlines due between now and 24 hours from now
    const upcomingDeadlines = await Deadline.find({
      dueDate: { $gte: now, $lte: next24Hours },
    });

    if (!upcomingDeadlines || upcomingDeadlines.length === 0) {
      return 0;
    }

    let remindersSent = 0;

    for (const deadline of upcomingDeadlines) {
      let targetClassIds = deadline.targetClassIds || [];

      // If 'all_classes' and targetClassIds is empty, resolve teacher's owned classes
      if (deadline.targetType === 'all_classes' && (!targetClassIds || targetClassIds.length === 0)) {
        if (deadline.createdBy) {
          const teacherClasses = await Class.find({ teacherId: deadline.createdBy }).select('_id');
          targetClassIds = teacherClasses.map((c) => c._id);
        }
      }

      if (!targetClassIds || targetClassIds.length === 0) {
        continue;
      }

      // Fetch enrolled students
      const classes = await Class.find({ _id: { $in: targetClassIds } }).select('students');
      const studentIds = new Set();
      for (const cls of classes) {
        if (Array.isArray(cls.students)) {
          cls.students.forEach((s) => studentIds.add(s.toString()));
        }
      }

      const dueFormatted = deadline.dueDate
        ? new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'soon';
      const timeFormatted = deadline.dueTime ? ` at ${deadline.dueTime}` : '';

      for (const sId of studentIds) {
        // Check if reminder already exists for this student and deadline
        const alreadyNotified = await Notification.exists({
          recipientId: new mongoose.Types.ObjectId(sId),
          relatedResourceId: deadline._id,
          type: 'deadline_reminder',
        });

        if (alreadyNotified) {
          continue;
        }

        const reminder = new Notification({
          recipientId: new mongoose.Types.ObjectId(sId),
          senderId: deadline.createdBy || null,
          type: 'deadline_reminder',
          title: `Upcoming Deadline: ${deadline.title}`,
          message: `Due within 24 hours (${dueFormatted}${timeFormatted}) for ${deadline.subject || 'your class'}.`,
          relatedResource: 'deadline',
          relatedResourceId: deadline._id,
          targetClassIds,
          isRead: false,
        });

        const savedReminder = await reminder.save();
        remindersSent++;

        if (io) {
          io.to(`user:${sId}`).emit('notification:new', savedReminder);
        }
      }
    }

    if (remindersSent > 0) {
      console.log(`[NotificationService] Generated ${remindersSent} upcoming deadline reminder(s).`);
    }

    return remindersSent;
  } catch (error) {
    console.error('[NotificationService] Error in reminder scheduler:', error);
    return 0;
  }
}

module.exports = {
  createNotificationsForTargetClasses,
  checkUpcomingDeadlineReminders,
};
