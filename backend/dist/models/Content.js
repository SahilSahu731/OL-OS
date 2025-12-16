"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contentSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['twitter', 'instagram', 'youtube'],
        required: true
    },
    type: {
        type: String,
        enum: ['tweet', 'thread', 'reel', 'post', 'video', 'short', 'story'],
        default: 'post'
    },
    status: {
        type: String,
        enum: ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'],
        default: 'idea'
    },
    description: {
        type: String,
        default: ''
    },
    script: {
        type: String,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    scheduledDate: {
        type: Date
    },
    publishedDate: {
        type: Date
    },
    url: {
        type: String
    },
    thumbnail: {
        type: String
    }
}, { timestamps: true });
exports.Content = mongoose_1.default.model('Content', contentSchema);
