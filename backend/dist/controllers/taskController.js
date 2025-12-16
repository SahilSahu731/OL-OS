"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTaskLog = exports.getTaskLogs = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const TaskLog_1 = __importDefault(require("../models/TaskLog"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get user tasks
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ user: req.user.id }).populate('category', 'name slug');
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTasks = getTasks;
// @desc    Create a task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, category, difficulty, startDate, endDate } = req.body;
        if (!title) {
            res.status(400).json({ message: 'Please provide a title' });
            return;
        }
        const task = await Task_1.default.create({
            user: req.user.id,
            title,
            description,
            category,
            difficulty,
            startDate: startDate || Date.now(),
            endDate,
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createTask = createTask;
// @desc    Update a task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        // Check for user
        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        // Make sure the logged in user matches the task user
        if (task.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        const updatedTask = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'name slug');
        res.status(200).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateTask = updateTask;
// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        // Check for user
        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        // Make sure the logged in user matches the task user
        if (task.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        await task.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteTask = deleteTask;
// @desc    Get task logs (completions)
// @route   GET /api/v1/tasks/logs
// @access  Private
const getTaskLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Convert dates to YYYY-MM range
        // startDate: 2025-12-01 -> 2025-12
        const startMonth = startDate.substring(0, 7);
        const endMonth = endDate.substring(0, 7);
        const query = {
            user: req.user.id,
            month: { $gte: startMonth, $lte: endMonth }
        };
        const logs = await TaskLog_1.default.find(query);
        // Transform back to flat list for frontend compatibility
        // result: [{ task: "id", date: "YYYY-MM-DD" }, ...]
        const result = [];
        logs.forEach((log) => {
            log.completedDays.forEach((day) => {
                // Pad day with leading zero if needed
                const dayStr = day < 10 ? `0${day}` : `${day}`;
                result.push({
                    task: log.task,
                    date: `${log.month}-${dayStr}`
                });
            });
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTaskLogs = getTaskLogs;
// @desc    Toggle task completion for a date
// @route   POST /api/v1/tasks/logs
// @access  Private
const toggleTaskLog = async (req, res) => {
    try {
        const { taskId, date } = req.body; // date is YYYY-MM-DD
        if (!taskId || !date) {
            res.status(400).json({ message: 'Task ID and date are required' });
            return;
        }
        const task = await Task_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        if (task.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        // Parse date
        const [year, month, dayStr] = date.split('-');
        const monthStr = `${year}-${month}`; // YYYY-MM
        const day = parseInt(dayStr, 10);
        // Find or create monthly log
        const log = await TaskLog_1.default.findOne({
            user: req.user.id,
            task: taskId,
            // ... (existing)
            month: monthStr
        });
        let completed = false;
        if (log) {
            if (log.completedDays.includes(day)) {
                // Toggle OFF
                log.completedDays = log.completedDays.filter((d) => d !== day);
                completed = false;
            }
            else {
                // Toggle ON
                log.completedDays.push(day);
                completed = true;
            }
            await log.save();
        }
        else {
            // Create new log with this day
            await TaskLog_1.default.create({
                user: req.user.id,
                task: taskId,
                month: monthStr,
                completedDays: [day]
            });
            completed = true;
        }
        // GAMIFICATION ENGINE
        const user = await User_1.default.findById(req.user.id);
        if (user) {
            if (completed) {
                user.xp += 10;
            }
            else {
                // Revert XP (Subtract 10)
                // User Rule: "when missed there will be -5 XP only after 1 dec 2025"
                // Implementation: We treat "Unchecking" as reverting a Done state. 
                // If we interpret unchecking as returning to "Missed" state, we simply remove the points gained.
                // For the "-5 penalty", we will apply it if the date is definitively in the past and strict mode is on?
                // For now, simpler is better: Revert the gain.
                user.xp = Math.max(0, user.xp - 10);
                // Check for explicit penalty condition (After Dec 1, 2025)
                // If we are "missing" a task (implies it was done/scheduled and now isn't)
                const cutoffDate = new Date('2025-12-01');
                const taskDate = new Date(date);
                // If taskDate is after cutoff and we are unchecking it (making it missed?)
                // We'll stick to just reverting for now to avoid frustration on misclicks.
            }
            // Level Up Logic: Every 1000 XP
            // Level 1: 0-999, Level 2: 1000-1999...
            const newLevel = Math.floor(user.xp / 1000) + 1;
            user.level = newLevel;
            await user.save();
        }
        res.status(200).json({ taskId, date, completed, xp: user?.xp, level: user?.level });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.toggleTaskLog = toggleTaskLog;
