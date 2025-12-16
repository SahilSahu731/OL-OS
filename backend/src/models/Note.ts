import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a note title'],
    default: 'Untitled Note',
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'default', // default, red, blue, green, yellow, purple
  }
}, {
  timestamps: true
});

export default mongoose.model('Note', noteSchema);
