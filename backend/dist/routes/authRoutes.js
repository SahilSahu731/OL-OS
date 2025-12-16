"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
// Admin routes
router.get('/', authMiddleware_1.protect, adminMiddleware_1.admin, userController_1.getAllUsers);
router.put('/:id/role', authMiddleware_1.protect, adminMiddleware_1.admin, userController_1.updateUserRole);
router.delete('/:id', authMiddleware_1.protect, adminMiddleware_1.admin, userController_1.deleteUser);
exports.default = router;
