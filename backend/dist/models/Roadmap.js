"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roadmapSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a feature title'],
        trim: true,
    },
    description: String,
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'icebox'],
        default: 'planned',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    type: {
        type: String,
        enum: ['feature', 'bug', 'enhancement'],
        default: 'feature'
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Roadmap', roadmapSchema);
