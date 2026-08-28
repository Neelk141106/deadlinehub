const express = require('express');
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

const router = express.Router();

// GET /api/announcements - Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ isPinned: -1, postedAt: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/announcements - Create a new announcement
router.post('/', async (req, res) => {
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

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/announcements/:id - Get a single announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/announcements/:id - Update an announcement by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

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
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/announcements/:id - Delete an announcement by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json({
      message: 'Announcement deleted successfully',
      deletedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
