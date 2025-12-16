"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const metricController_1 = require("../controllers/metricController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.protect, metricController_1.getMetrics)
    .post(authMiddleware_1.protect, metricController_1.updateMetric);
router.post('/seed', authMiddleware_1.protect, metricController_1.seedMetrics);
exports.default = router;
