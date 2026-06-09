import express from 'express';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    getTaskLogs,
    toggleTaskLog,
    getNowPlan
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/logs')
  .get(protect, getTaskLogs)
  .post(protect, toggleTaskLog);

router.route('/now')
  .get(protect, getNowPlan);

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;
