"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoadmapItem = exports.updateRoadmapItem = exports.createRoadmapItem = exports.getRoadmap = void 0;
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const getRoadmap = async (req, res) => {
    try {
        const features = await Roadmap_1.default.find({ user: req.user.id }).sort({ status: 1 });
        res.status(200).json(features);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRoadmap = getRoadmap;
const createRoadmapItem = async (req, res) => {
    try {
        const item = await Roadmap_1.default.create({
            user: req.user.id,
            ...req.body
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createRoadmapItem = createRoadmapItem;
const updateRoadmapItem = async (req, res) => {
    try {
        const item = await Roadmap_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(item);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateRoadmapItem = updateRoadmapItem;
const deleteRoadmapItem = async (req, res) => {
    try {
        await Roadmap_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteRoadmapItem = deleteRoadmapItem;
