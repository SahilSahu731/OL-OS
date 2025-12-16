"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workoutController_1 = require("../controllers/workoutController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.route('/').get(workoutController_1.getWorkouts).post(workoutController_1.createWorkout);
router.route('/:id').get(workoutController_1.getWorkout).put(workoutController_1.updateWorkout).delete(workoutController_1.deleteWorkout);
exports.default = router;
