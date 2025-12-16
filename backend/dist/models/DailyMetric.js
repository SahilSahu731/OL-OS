"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dailyMetricSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    weight: {
        type: Number,
        default: 0,
    },
    hp: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});
// Unique metric per day
dailyMetricSchema.index({ user: 1, date: 1 }, { unique: true });
exports.default = mongoose_1.default.model('DailyMetric', dailyMetricSchema);
