const express = require('express');
const Announcement = require('../models/Announcement');
const AppError = require('../utils/AppError');
const { validateObjectId, validateAnnouncement } = require('../middleware/validate');

const router = express.Router();

// GET /api/announcements - Get all announcements
router.get('/', async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ isPinned: -1, postedAt: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    next(error);
  }
});

// POST /api/announcements - Create a new announcement
router.post('/', validateAnnouncement(false), async (req, res, next) => {
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
    } = req.body;

    const priorityVal = priority || 'Normal';
    const computedVariant = priorityVariant || priorityVal.toLowerCase();
    const computedText = priorityText || priorityVal.toUpperCase();

    const announcement = new Announcement({
      title: title.trim(),
      message: message.trim(),
      category: category || 'Academic',
      priority: priorityVal,
      priorityVariant: computedVariant,
      priorityText: computedText,
      isPinned: isPinned !== undefined ? isPinned : false,
      postedBy: postedBy ? postedBy.trim() : 'Admin',
      postedTime: postedTime || 'Just now',
      postedAt: postedAt || new Date(),
      branch: branch || 'Information Technology',
      semester: semester || 'Semester 5',
      division: division || 'All Divisions',
    });

    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    next(error);
  }
});

// GET /api/announcements/:id - Get a single announcement by ID
router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
});

// PUT /api/announcements/:id - Update an announcement by ID
router.put('/:id', validateObjectId, validateAnnouncement(true), async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    if (updateData.priority && !updateData.priorityVariant) {
      updateData.priorityVariant = updateData.priority.toLowerCase();
    }
    if (updateData.priority && !updateData.priorityText) {
      updateData.priorityText = updateData.priority.toUpperCase();
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/announcements/:id - Delete an announcement by ID
router.delete('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return next(new AppError('Announcement not found', 404));
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
