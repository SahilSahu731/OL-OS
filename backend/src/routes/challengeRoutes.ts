import express from 'express';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge, logDailyProgress, failChallenge } from '../controllers/challengeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getChallenges);
router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.post('/:id/log', logDailyProgress);
router.post('/:id/fail', failChallenge); // New explicit fail route
router.delete('/:id', deleteChallenge);

export default router;
