"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(categoryController_1.getCategories)
    .post(authMiddleware_1.protect, adminMiddleware_1.admin, categoryController_1.createCategory);
router.get('/stats', authMiddleware_1.protect, categoryController_1.getCategoryStats);
router.route('/:id')
    .put(authMiddleware_1.protect, adminMiddleware_1.admin, categoryController_1.updateCategory)
    .delete(authMiddleware_1.protect, adminMiddleware_1.admin, categoryController_1.deleteCategory);
exports.default = router;
