"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const exerciseSchema = new mongoose_1.default.Schema({
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
const workoutSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
    duration: {
        type: Number,
        default: 0
    },
    exercises: [exerciseSchema],
    notes: String
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Workout', workoutSchema);
