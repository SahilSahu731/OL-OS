import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a feature title'],
    trim: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'icebox'],
    default: 'planned',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  type: {
      type: String,
      enum: ['feature', 'bug', 'enhancement'],
      default: 'feature'
  }
}, {
  timestamps: true
});

export default mongoose.model('Roadmap', roadmapSchema);
