import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: [{
    weight: Number,
    reps: Number,
    rpe: Number,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  notes: String
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: 'Untitled Workout',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  duration: { // in minutes
    type: Number,
    default: 0
  },
  exercises: [exerciseSchema],
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema);
