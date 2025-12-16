"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // For initial seed, we might not have a user
    }
}, {
    timestamps: true
});
// Create slug from name
categorySchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-');
    }
});
exports.default = mongoose_1.default.model('Category', categorySchema);
