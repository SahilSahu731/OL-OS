import { Request, Response } from 'express';
import Note from '../models/Note';

// @desc    Get user notes
// @route   GET /api/v1/notes
// @access  Private
export const getNotes = async (req: any, res: Response) => {
  try {
    const notes = await Note.find({ user: req.user.id, isArchived: false }).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a note
// @route   POST /api/v1/notes
// @access  Private
export const createNote = async (req: any, res: Response) => {
  try {
    const { title, content, tags, color, isPinned } = req.body;

    const note = await Note.create({
      user: req.user.id,
      title: title || 'Untitled Note',
      content,
      tags,
      color,
      isPinned
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a note
// @route   PUT /api/v1/notes/:id
// @access  Private
export const updateNote = async (req: any, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    if (note.user.toString() !== req.user.id) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete (archive) a note
// @route   DELETE /api/v1/notes/:id
// @access  Private
export const deleteNote = async (req: any, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);

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
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
