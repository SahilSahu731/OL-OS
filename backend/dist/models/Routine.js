"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const exerciseTemplateSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    sets: [{
            weight: { type: Number, default: 0 },
            reps: { type: Number, default: 0 },
            rpe: { type: Number, default: 0 }
        }],
    notes: String
});
const routineSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    days: [{
            type: String, // 'Mon', 'Tue', etc.
        }],
    exercises: [exerciseTemplateSchema],
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Routine', routineSchema);
