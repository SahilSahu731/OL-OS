import { Request, Response } from 'express';
import { Content } from '../models/Content';

export const getContents = async (req: Request, res: Response) => {
  try {
    const contents = await Content.find({ user: (req as any).user.id }).sort({ createdAt: -1 });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { title, platform, type, status, description, script, tags, scheduledDate } = req.body;
    const content = await Content.create({
      user: (req as any).user.id,
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await Content.findOneAndUpdate(
      { _id: id, user: (req as any).user.id },
      req.body,
      { new: true }
    );
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await Content.findOneAndDelete({ _id: id, user: (req as any).user.id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
