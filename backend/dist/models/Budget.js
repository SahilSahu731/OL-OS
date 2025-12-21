"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const budgetSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    period: { type: String, default: 'monthly' } // currently only supporting monthly
}, { timestamps: true });
// One budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Budget', budgetSchema);
