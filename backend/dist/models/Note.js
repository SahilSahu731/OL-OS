"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a note title'],
        default: 'Untitled Note',
        trim: true,
    },
    content: {
        type: String,
        default: '',
    },
    tags: [{
            type: String,
            trim: true
        }],
    isPinned: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    color: {
        type: String,
        default: 'default', // default, red, blue, green, yellow, purple
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Note', noteSchema);
