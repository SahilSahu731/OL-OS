import mongoose from 'mongoose';

const timeBlockSchema = new mongoose.Schema({
  label: {
    type: String,
    trim: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/,
  },
  days: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6],
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  _id: true,
});

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false, // Optional for now, or could be required
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    // If null/undefined, it repeats forever
  },
  active: {
    type: Boolean,
    default: true,
  },
  timeBlocks: {
    type: [timeBlockSchema],
    default: [],
  },
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);
