"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContent = exports.updateContent = exports.createContent = exports.getContents = void 0;
const Content_1 = require("../models/Content");
const getContents = async (req, res) => {
    try {
        const contents = await Content_1.Content.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(contents);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getContents = getContents;
const createContent = async (req, res) => {
    try {
        const { title, platform, type, status, description, script, tags, scheduledDate } = req.body;
        const content = await Content_1.Content.create({
            user: req.user.id,
            title,
            platform,
            type,
            status,
            description,
            script,
            tags,
            scheduledDate
        });
        res.status(201).json(content);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createContent = createContent;
const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.Content.findOneAndUpdate({ _id: id, user: req.user.id }, req.body, { new: true });
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json(content);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateContent = updateContent;
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.Content.findOneAndDelete({ _id: id, user: req.user.id });
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json({ message: 'Content removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteContent = deleteContent;
