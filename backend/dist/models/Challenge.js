"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ChallengeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    theme: { type: String, enum: ['red', 'gold', 'blue', 'purple', 'obsidian'], default: 'red' },
    daysTotal: { type: Number, required: true },
    startDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'failed', 'available'], default: 'active' },
    mode: { type: String, enum: ['standard', 'hardcore'], default: 'standard' },
    allowedStrikes: { type: Number, default: 3 },
    currentStrikes: { type: Number, default: 0 },
    stakes: { type: String, default: '' },
    commitmentLevel: { type: String, enum: ['casual', 'serious', 'fanatic'], default: 'serious' },
    rules: [{
            text: { type: String, required: true },
            type: { type: String, enum: ['boolean', 'numeric', 'time'], default: 'boolean' },
            target: Number
        }],
    logs: [{
            date: { type: Date, default: Date.now },
            completed: { type: Boolean, default: false },
            reflection: {
                question: String,
                answer: String
            },
            evidenceUrl: String,
            checklist: [{ type: Boolean }],
            numericValue: Number
        }],
    participants: { type: Number, default: 1 },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Challenge', ChallengeSchema);
