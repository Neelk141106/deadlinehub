const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Academic',
    },
    priority: {
      type: String,
      trim: true,
      default: 'Normal',
    },
    priorityVariant: {
      type: String,
      trim: true,
      default: 'normal',
    },
    priorityText: {
      type: String,
      trim: true,
      default: 'NORMAL',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    postedTime: {
      type: String,
      trim: true,
      default: 'Just now',
    },
    postedAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model('Announcement', announcementSchema);
