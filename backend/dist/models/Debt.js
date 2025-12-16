"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const debtSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['payable', 'receivable'], // payable = I owe, receivable = They owe me
        required: true
    },
    person: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date
    },
    isSettled: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Debt', debtSchema);
