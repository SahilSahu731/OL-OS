"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const weeklyLogSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekStartDate: {
        type: String, // YYYY-MM-DD (Monday of the week)
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    mainFocus: {
        type: String,
        default: ''
    },
    wins: {
        type: [String],
        default: []
    },
    lessons: {
        type: [String],
        default: []
    },
    rating: {
        type: Number, // 1-10 or 1-5
        default: 0
    },
    energyLevel: {
        type: Number,
        default: 5
    },
    goalsForNextWeek: {
        type: String,
        default: ''
    },
    mood: {
        type: String,
        default: ''
    }
}, { timestamps: true });
weeklyLogSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });
exports.WeeklyLog = mongoose_1.default.model('WeeklyLog', weeklyLogSchema);
