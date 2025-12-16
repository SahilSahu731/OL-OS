"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roadmapController_1 = require("../controllers/roadmapController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.route('/').get(roadmapController_1.getRoadmap).post(roadmapController_1.createRoadmapItem);
router.route('/:id').put(roadmapController_1.updateRoadmapItem).delete(roadmapController_1.deleteRoadmapItem);
exports.default = router;
