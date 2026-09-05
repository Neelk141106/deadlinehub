const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

/**
 * Validate MongoDB ObjectId in req.params.id
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid ID format', 400));
  }
  next();
};

/**
 * Validate create/update Deadline payload
 */
const validateDeadline = (isUpdate = false) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return next(new AppError('Request body must be a valid JSON object', 400));
    }

    const { title, dueDate } = req.body;

    // Check title if present or creating new
    if (!isUpdate || title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return next(new AppError('Title is required and cannot be empty', 400));
      }
    }

    // Check dueDate if present or creating new
    if (!isUpdate || dueDate !== undefined) {
      if (!dueDate) {
        return next(new AppError('Due date is required', 400));
      }
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return next(new AppError('Due date must be a valid date', 400));
      }
    }

    next();
  };
};

/**
 * Validate create/update Announcement payload
 */
const validateAnnouncement = (isUpdate = false) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return next(new AppError('Request body must be a valid JSON object', 400));
    }

    const { title, message } = req.body;

    // Check title if present or creating new
    if (!isUpdate || title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return next(new AppError('Title is required and cannot be empty', 400));
      }
    }

    // Check message if present or creating new
    if (!isUpdate || message !== undefined) {
      if (!message || typeof message !== 'string' || !message.trim()) {
        return next(new AppError('Message is required and cannot be empty', 400));
      }
    }

    next();
  };
};

module.exports = {
  validateObjectId,
  validateDeadline,
  validateAnnouncement,
};
