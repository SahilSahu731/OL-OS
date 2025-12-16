import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'instagram', 'youtube'],
    required: true
  },
  type: {
    type: String,
    enum: ['tweet', 'thread', 'reel', 'post', 'video', 'short', 'story'],
    default: 'post'
  },
  status: {
    type: String,
    enum: ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'],
    default: 'idea'
  },
  description: {
    type: String,
    default: ''
  },
  script: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  scheduledDate: {
    type: Date
  },
  publishedDate: {
    type: Date
  },
  url: {
    type: String
  },
  thumbnail: {
    type: String
  }
}, { timestamps: true });

export const Content = mongoose.model('Content', contentSchema);
