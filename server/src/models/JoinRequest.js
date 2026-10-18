const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure fast queries and uniqueness checks per student & class
joinRequestSchema.index({ studentId: 1, classId: 1 });
joinRequestSchema.index({ teacherId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
