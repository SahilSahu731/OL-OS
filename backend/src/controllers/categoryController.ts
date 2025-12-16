import { Request, Response } from 'express';
import Category from '../models/Category';
import TaskLog from '../models/TaskLog';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Please provide a category name' });
      return;
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = await Category.create({
      name,
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Seed initial categories
// @access  Internal
export const seedCategories = async () => {
  const initialCategories = [
    'reading', 'docs', 'startup', 'leetcode', 'DSA', 'code', 
    'project', 'twitter', 'social', 'health', 'calesthenics', 
    'workout', 'content', 'grow', 'japanese', 'CS core'
  ];

  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const categoriesToInsert = initialCategories.map(name => ({ name }));
      await Category.insertMany(categoriesToInsert);
      console.log('Initial categories seeded');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// @desc    Get category stats for the current user (XP, Levels)
// @route   GET /api/v1/categories/stats
// @access  Private
export const getCategoryStats = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // 1. Get all categories first
    const allCategories = await Category.find({}).lean();

    // 2. Aggregate XP from TaskLogs
    const stats = await TaskLog.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      { $match: { 'taskDetails.category': { $exists: true, $ne: null } } },
      {
        $addFields: {
          daysCount: { $size: '$completedDays' },
          xpPerDay: {
            $switch: {
              branches: [
                { case: { $eq: ['$taskDetails.difficulty', 'Hard'] }, then: 50 },
                { case: { $eq: ['$taskDetails.difficulty', 'Medium'] }, then: 25 },
                { case: { $eq: ['$taskDetails.difficulty', 'Easy'] }, then: 10 }
              ],
              default: 10
            }
          }
        }
      },
      {
        $addFields: {
          totalXpForEntry: { $multiply: ['$daysCount', '$xpPerDay'] }
        }
      },
      {
        $group: {
          _id: '$taskDetails.category',
          totalXP: { $sum: '$totalXpForEntry' },
          totalTasks: { $addToSet: '$taskDetails._id' }
        }
      },
      {
        $project: {
          _id: 1,
          totalXP: 1,
          activeTasksCount: { $size: '$totalTasks' }
        }
      }
    ]);

    // 3. Merge stats into categories
    const enrichedCategories = allCategories.map((cat: any) => {
      const stat = stats.find((s: any) => s._id.toString() === cat._id.toString());
      const xp = stat ? stat.totalXP : 0;
      const tasks = stat ? stat.activeTasksCount : 0;
      
      // Level Formula: Level 1 starts at 0. Scale factor 100 * Level. 
      // Simplified: Level = Math.floor(Math.sqrt(xp / 50)) + 1
      // let's say 100xp = level 2. 400xp = level 3. 
      const level = Math.floor(Math.sqrt(xp / 50)) + 1;
      
      // Progress to next level
      // next level xp needed = (level)^2 * 50
      // current level base xp = (level-1)^2 * 50
      const nextLevelXp = Math.pow(level, 2) * 50;
      const currentLevelBaseXp = Math.pow(level - 1, 2) * 50;
      const progress = Math.min(100, Math.floor(((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100));

      return {
        ...cat,
        xp,
        level,
        progress,
        taskCount: tasks
      };
    });

    res.status(200).json(enrichedCategories);

  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};
