"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMetrics = exports.updateMetric = exports.getMetrics = void 0;
const DailyMetric_1 = __importDefault(require("../models/DailyMetric"));
// @desc    Get metrics for date range
// @route   GET /api/v1/metrics
// @access  Private
const getMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { user: req.user.id };
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        const metrics = await DailyMetric_1.default.find(query);
        res.status(200).json(metrics);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMetrics = getMetrics;
// @desc    Update metric for a date
// @route   POST /api/v1/metrics
// @access  Private
const updateMetric = async (req, res) => {
    try {
        const { date, weight, hp } = req.body;
        if (!date) {
            res.status(400).json({ message: 'Date is required' });
            return;
        }
        const metric = await DailyMetric_1.default.findOneAndUpdate({ user: req.user.id, date }, {
            $set: {
                ...(weight !== undefined && { weight }),
                ...(hp !== undefined && { hp })
            }
        }, { new: true, upsert: true });
        res.status(200).json(metric);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateMetric = updateMetric;
// @desc    Seed initial metrics
// @route   POST /api/v1/metrics/seed
// @access  Private (or Public for dev)
const seedMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        // Seed Dec 1 to Dec 16 2025? User said "1 dec to 16 dec".
        // Assuming current year (2025 in this context).
        const updates = [];
        for (let i = 1; i <= 16; i++) {
            const day = i < 10 ? `0${i}` : `${i}`;
            const date = `2025-12-${day}`;
            // Random HP between 6.5 and 7.2
            const hp = parseFloat((Math.random() * (7.2 - 6.5) + 6.5).toFixed(1));
            // Random Weight between 70.0 and 70.5 (just placeholder)
            const weight = parseFloat((Math.random() * (70.5 - 70.0) + 70.0).toFixed(1));
            updates.push({
                updateOne: {
                    filter: { user: userId, date },
                    update: { $set: { hp, weight } },
                    upsert: true
                }
            });
        }
        if (updates.length > 0) {
            await DailyMetric_1.default.bulkWrite(updates);
        }
        res.status(200).json({ message: 'Seeded successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.seedMetrics = seedMetrics;
