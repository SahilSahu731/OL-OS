import express from 'express';
const router = express.Router();
import { getContents, createContent, updateContent, deleteContent } from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';

router.route('/').get(protect, getContents).post(protect, createContent);
router.route('/:id').put(protect, updateContent).delete(protect, deleteContent);

export default router;
