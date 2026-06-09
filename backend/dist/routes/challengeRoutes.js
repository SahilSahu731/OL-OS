"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challengeController_1 = require("../controllers/challengeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/', challengeController_1.getChallenges);
router.post('/', challengeController_1.createChallenge);
router.put('/:id', challengeController_1.updateChallenge);
router.post('/:id/log', challengeController_1.logDailyProgress);
router.post('/:id/fail', challengeController_1.failChallenge); // New explicit fail route
router.delete('/:id', challengeController_1.deleteChallenge);
exports.default = router;
