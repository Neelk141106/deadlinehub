const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      trim: true,
      default: 'Assignment',
    },
    priority: {
      type: String,
      trim: true,
      default: 'Normal',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    dueTime: {
      type: String,
      trim: true,
      default: '23:59',
    },
    branch: {
      type: String,
      trim: true,
      default: 'Information Technology',
    },
    semester: {
      type: String,
      trim: true,
      default: 'Semester 5',
    },
    division: {
      type: String,
      trim: true,
      default: 'All Divisions',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Deadline', deadlineSchema);
