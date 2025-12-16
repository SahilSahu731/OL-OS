"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    bio: {
        type: String,
        default: ''
    },
    tagline: {
        type: String,
        default: 'Player 1'
    },
    location: {
        type: String,
        default: 'Earth'
    },
    website: {
        type: String,
        default: ''
    },
    goals: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    attributes: {
        intelligence: { type: Number, default: 10 },
        discipline: { type: Number, default: 10 },
        creativity: { type: Number, default: 10 },
        vitality: { type: Number, default: 10 }
    }
}, {
    timestamps: true
});
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
exports.default = mongoose_1.default.model('User', userSchema);
