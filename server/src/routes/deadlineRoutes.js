const express = require('express');
const Deadline = require('../models/Deadline');
const AppError = require('../utils/AppError');
const { validateObjectId, validateDeadline } = require('../middleware/validate');

const router = express.Router();

// GET /api/deadlines - Get all deadlines
router.get('/', async (req, res, next) => {
  try {
    const deadlines = await Deadline.find().sort({ dueDate: 1, createdAt: -1 });
    res.status(200).json(deadlines);
  } catch (error) {
    next(error);
  }
});

// POST /api/deadlines - Create a new deadline
router.post('/', validateDeadline(false), async (req, res, next) => {
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
    } = req.body;

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
    next(error);
  }
});

// GET /api/deadlines/:id - Get a single deadline by ID
router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deadline = await Deadline.findById(id);

    if (!deadline) {
      return next(new AppError('Deadline not found', 404));
    }

    res.status(200).json(deadline);
  } catch (error) {
    next(error);
  }
});

// PUT /api/deadlines/:id - Update a deadline by ID
router.put('/:id', validateObjectId, validateDeadline(true), async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedDeadline = await Deadline.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDeadline) {
      return next(new AppError('Deadline not found', 404));
    }

    res.status(200).json(updatedDeadline);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/deadlines/:id - Delete a deadline by ID
router.delete('/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedDeadline = await Deadline.findByIdAndDelete(id);
    if (!deletedDeadline) {
      return next(new AppError('Deadline not found', 404));
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
