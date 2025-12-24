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
  },
  tasks: [{
    id: String,
    text: String,
    isCompleted: { type: Boolean, default: false },
    phase: { type: String } 
  }],
  researchNotes: { type: String, default: '' },
  researchLinks: [{
      title: String,
      url: String
  }],
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    retention: { type: Number, default: 0 } // Avg view duration %
  },
  branding: {
    thumbnailA: String,
    thumbnailB: String,
    selectedThumbnail: String
  }
}, { timestamps: true });

export const Content = mongoose.model('Content', contentSchema);
