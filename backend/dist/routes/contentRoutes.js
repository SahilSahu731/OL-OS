"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const contentController_1 = require("../controllers/contentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
router.route('/').get(authMiddleware_1.protect, contentController_1.getContents).post(authMiddleware_1.protect, contentController_1.createContent);
router.route('/:id').put(authMiddleware_1.protect, contentController_1.updateContent).delete(authMiddleware_1.protect, contentController_1.deleteContent);
exports.default = router;
