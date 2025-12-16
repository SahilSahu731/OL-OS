import { Request, Response } from 'express';
import Roadmap from '../models/Roadmap';

export const getRoadmap = async (req: any, res: Response) => {
  try {
    const features = await Roadmap.find({ user: req.user.id }).sort({ status: 1 });
    res.status(200).json(features);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createRoadmapItem = async (req: any, res: Response) => {
  try {
    const item = await Roadmap.create({
      user: req.user.id,
      ...req.body
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateRoadmapItem = async (req: any, res: Response) => {
  try {
    const item = await Roadmap.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteRoadmapItem = async (req: any, res: Response) => {
  try {
    await Roadmap.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
