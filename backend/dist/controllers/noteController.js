"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
// @desc    Get user notes
// @route   GET /api/v1/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note_1.default.find({ user: req.user.id, isArchived: false }).sort({ isPinned: -1, updatedAt: -1 });
        res.status(200).json(notes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getNotes = getNotes;
// @desc    Create a note
// @route   POST /api/v1/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const { title, content, tags, color, isPinned } = req.body;
        const note = await Note_1.default.create({
            user: req.user.id,
            title: title || 'Untitled Note',
            content,
            tags,
            color,
            isPinned
        });
        res.status(201).json(note);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }
        if (note.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        const updatedNote = await Note_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedNote);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    try {
        const note = await Note_1.default.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }
        if (note.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        // Hard delete for now, or use Archive
        await note.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteNote = deleteNote;
