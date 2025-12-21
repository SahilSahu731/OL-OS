"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const routineController_1 = require("../controllers/routineController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.post('/seed', routineController_1.seedRoutines);
router.route('/')
    .get(routineController_1.getRoutines)
    .post(routineController_1.createRoutine);
router.route('/:id')
    .put(routineController_1.updateRoutine)
    .delete(routineController_1.deleteRoutine);
exports.default = router;
