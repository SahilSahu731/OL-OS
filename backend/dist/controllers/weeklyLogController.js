"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWeeklyLog = exports.getWeeklyLogByDate = exports.getWeeklyLogs = void 0;
const WeeklyLog_1 = require("../models/WeeklyLog");
const getWeeklyLogs = async (req, res) => {
    try {
        const logs = await WeeklyLog_1.WeeklyLog.find({ user: req.user.id }).sort({ weekStartDate: -1 });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getWeeklyLogs = getWeeklyLogs;
const getWeeklyLogByDate = async (req, res) => {
    try {
        const { weekStartDate } = req.params;
        const log = await WeeklyLog_1.WeeklyLog.findOne({ user: req.user.id, weekStartDate });
        if (!log) {
            // Return empty skeleton if not found, don't 404, just let frontend know it's new
            return res.json({ weekStartDate, content: '', rating: 0, goalsForNextWeek: '', mood: '' });
        }
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getWeeklyLogByDate = getWeeklyLogByDate;
const updateWeeklyLog = async (req, res) => {
    try {
        const { weekStartDate, title, content, mainFocus, wins, lessons, rating, energyLevel, goalsForNextWeek, mood } = req.body;
        const log = await WeeklyLog_1.WeeklyLog.findOneAndUpdate({ user: req.user.id, weekStartDate }, { title, content, mainFocus, wins, lessons, rating, energyLevel, goalsForNextWeek, mood }, { new: true, upsert: true });
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateWeeklyLog = updateWeeklyLog;
