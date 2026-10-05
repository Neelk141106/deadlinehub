const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    division: {
      type: String,
      trim: true,
      default: '',
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups by teacherId and student enrollment
classSchema.index({ teacherId: 1 });
classSchema.index({ students: 1 });

module.exports = mongoose.model('Class', classSchema);
