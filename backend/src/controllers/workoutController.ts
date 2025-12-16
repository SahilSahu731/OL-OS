import { Request, Response } from 'express';
import Workout from '../models/Workout';
import User from '../models/User';

// @desc    Get all workouts for user
// @route   GET /api/v1/workouts
// @access  Private
export const getWorkouts = async (req: any, res: Response) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get single workout
// @route   GET /api/v1/workouts/:id
// @access  Private
export const getWorkout = async (req: any, res: Response) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    if (workout.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a workout
// @route   POST /api/v1/workouts
// @access  Private
export const createWorkout = async (req: any, res: Response) => {
  try {
    const { name, date, duration, exercises, notes } = req.body;

    const workout = await Workout.create({
      user: req.user.id,
      name,
      date: date || Date.now(),
      duration,
      exercises,
      notes
    });

    // Gamification: Add XP for workout
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += 50; // 50 XP for a workout
      const newLevel = Math.floor(user.xp / 1000) + 1;
      user.level = newLevel;
      await user.save();
    }

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a workout
// @route   PUT /api/v1/workouts/:id
// @access  Private
export const updateWorkout = async (req: any, res: Response) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    if (workout.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/v1/workouts/:id
// @access  Private
export const deleteWorkout = async (req: any, res: Response) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    if (workout.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    await workout.deleteOne();

    res.json({ message: 'Workout removed' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
