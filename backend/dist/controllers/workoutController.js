"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkout = exports.updateWorkout = exports.createWorkout = exports.getWorkout = exports.getWorkouts = void 0;
const Workout_1 = __importDefault(require("../models/Workout"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all workouts for user
// @route   GET /api/v1/workouts
// @access  Private
const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout_1.default.find({ user: req.user.id }).sort({ date: -1 });
        res.json(workouts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getWorkouts = getWorkouts;
// @desc    Get single workout
// @route   GET /api/v1/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
    try {
        const workout = await Workout_1.default.findById(req.params.id);
        if (!workout) {
            res.status(404).json({ message: 'Workout not found' });
            return;
        }
        if (workout.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        res.json(workout);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getWorkout = getWorkout;
// @desc    Create a workout
// @route   POST /api/v1/workouts
// @access  Private
const createWorkout = async (req, res) => {
    try {
        const { name, date, duration, exercises, notes } = req.body;
        const workout = await Workout_1.default.create({
            user: req.user.id,
            name,
            date: date || Date.now(),
            duration,
            exercises,
            notes
        });
        // Gamification: Add XP for workout
        const user = await User_1.default.findById(req.user.id);
        if (user) {
            user.xp += 50; // 50 XP for a workout
            const newLevel = Math.floor(user.xp / 1000) + 1;
            user.level = newLevel;
            await user.save();
        }
        res.status(201).json(workout);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createWorkout = createWorkout;
// @desc    Update a workout
// @route   PUT /api/v1/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
    try {
        let workout = await Workout_1.default.findById(req.params.id);
        if (!workout) {
            res.status(404).json({ message: 'Workout not found' });
            return;
        }
        if (workout.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        workout = await Workout_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.json(workout);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateWorkout = updateWorkout;
// @desc    Delete a workout
// @route   DELETE /api/v1/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteWorkout = deleteWorkout;
