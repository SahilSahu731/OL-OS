"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskLogSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    task: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    month: {
        type: String, // YYYY-MM
        required: true,
    },
    completedDays: [{
            type: Number, // 1-31
        }]
}, {
    timestamps: true
});
// Unique log per task per month
taskLogSchema.index({ task: 1, month: 1 }, { unique: true });
exports.default = mongoose_1.default.model('TaskLog', taskLogSchema);
