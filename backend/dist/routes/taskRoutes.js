"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/logs')
    .get(authMiddleware_1.protect, taskController_1.getTaskLogs)
    .post(authMiddleware_1.protect, taskController_1.toggleTaskLog);
router.route('/')
    .get(authMiddleware_1.protect, taskController_1.getTasks)
    .post(authMiddleware_1.protect, taskController_1.createTask);
router.route('/:id')
    .put(authMiddleware_1.protect, taskController_1.updateTask)
    .delete(authMiddleware_1.protect, taskController_1.deleteTask);
exports.default = router;
