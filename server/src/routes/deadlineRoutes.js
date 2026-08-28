const express = require('express');
const mongoose = require('mongoose');
const Deadline = require('../models/Deadline');

const router = express.Router();

// GET /api/deadlines - Get all deadlines
router.get('/', async (req, res) => {
  try {
    const deadlines = await Deadline.find().sort({ dueDate: 1, createdAt: -1 });
    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/deadlines - Create a new deadline
router.post('/', async (req, res) => {
  try {
    const { title, subject, description, type, priority, dueDate, dueTime, branch, semester, division } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }

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
    });

    const savedDeadline = await deadline.save();
    res.status(201).json(savedDeadline);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deadlines/:id - Get a single deadline by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deadline = await Deadline.findById(id);
    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json(deadline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/deadlines/:id - Update a deadline by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updatedDeadline = await Deadline.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDeadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json(updatedDeadline);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/deadlines/:id - Delete a deadline by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deletedDeadline = await Deadline.findByIdAndDelete(id);
    if (!deletedDeadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json({
      message: 'Deadline deleted successfully',
      deletedDeadline,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
