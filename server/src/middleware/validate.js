const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

/**
 * Validate MongoDB ObjectId in req.params.id
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id) || !/^[0-9a-fA-F]{24}$/.test(id)) {
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

/**
 * Validate User Registration payload
 */
const validateRegister = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new AppError('Request body must be a valid JSON object', 400));
  }

  const { name, email, password, role } = req.body;

  // Validate name
  if (!name || typeof name !== 'string' || !name.trim()) {
    return next(new AppError('Name is required and cannot be empty', 400));
  }

  // Validate email
  if (!email || typeof email !== 'string' || !email.trim()) {
    return next(new AppError('Email is required and cannot be empty', 400));
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(email.trim())) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    return next(new AppError('Password is required', 400));
  }
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  // Validate role if provided
  if (role !== undefined) {
    if (typeof role !== 'string' || !['student', 'teacher'].includes(role.toLowerCase().trim())) {
      return next(new AppError('Role must be either student or teacher', 400));
    }
  }

  next();
};

module.exports = {
  validateObjectId,
  validateDeadline,
  validateAnnouncement,
  validateRegister,
};
