import express from 'express';
import {
  getRoadmap,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
} from '../controllers/roadmapController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.use(protect);

router.route('/').get(getRoadmap).post(createRoadmapItem);
router.route('/:id').put(updateRoadmapItem).delete(deleteRoadmapItem);

export default router;
