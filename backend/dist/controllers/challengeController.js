"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChallenge = exports.failChallenge = exports.logDailyProgress = exports.updateChallenge = exports.createChallenge = exports.getChallenges = void 0;
const Challenge_1 = __importDefault(require("../models/Challenge"));
const getChallenges = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const challenges = await Challenge_1.default.find({ userId }).sort({ status: 1, createdAt: -1 });
        res.status(200).json(challenges);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching challenges', error });
    }
};
exports.getChallenges = getChallenges;
const createChallenge = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { mode } = req.body;
        // Auto-configure strikes based on mode
        const allowedStrikes = mode === 'hardcore' ? 0 : 3;
        const newChallenge = new Challenge_1.default({
            ...req.body,
            userId,
            startDate: new Date(),
            status: 'active',
            allowedStrikes
        });
        const savedChallenge = await newChallenge.save();
        res.status(201).json(savedChallenge);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating challenge', error });
    }
};
exports.createChallenge = createChallenge;
const updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedChallenge = await Challenge_1.default.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedChallenge);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating challenge', error });
    }
};
exports.updateChallenge = updateChallenge;
const logDailyProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, reflection, checklist, completed } = req.body;
        const challenge = await Challenge_1.default.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        // Logic for Hardcore failure
        if (!completed) {
            challenge.currentStrikes += 1;
            if (challenge.currentStrikes > challenge.allowedStrikes) {
                challenge.status = 'failed';
            }
        }
        // Add log entry
        challenge.logs.push({
            date: date || new Date(),
            completed: completed !== undefined ? completed : true,
            reflection,
            checklist
        });
        // Check if finished (Success)
        const successfulDays = challenge.logs.filter(l => l.completed).length;
        if (challenge.status !== 'failed' && successfulDays >= challenge.daysTotal) {
            challenge.status = 'completed';
        }
        const updated = await challenge.save();
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging progress', error });
    }
};
exports.logDailyProgress = logDailyProgress;
const failChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge_1.default.findById(id);
        if (!challenge)
            return res.status(404).json({ message: 'Not found' });
        challenge.status = 'failed';
        challenge.currentStrikes = challenge.allowedStrikes + 1;
        const updated = await challenge.save();
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Error failing challenge' });
    }
};
exports.failChallenge = failChallenge;
const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        await Challenge_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Challenge deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting challenge', error });
    }
};
exports.deleteChallenge = deleteChallenge;
