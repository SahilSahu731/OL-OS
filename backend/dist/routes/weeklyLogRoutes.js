"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const weeklyLogController_1 = require("../controllers/weeklyLogController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, weeklyLogController_1.getWeeklyLogs);
router.get('/:weekStartDate', authMiddleware_1.protect, weeklyLogController_1.getWeeklyLogByDate);
router.post('/', authMiddleware_1.protect, weeklyLogController_1.updateWeeklyLog);
exports.default = router;
