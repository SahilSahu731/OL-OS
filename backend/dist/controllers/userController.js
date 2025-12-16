"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserRole = updateUserRole;
// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await user.deleteOne();
        res.status(200).json({ message: 'User removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUser = deleteUser;
