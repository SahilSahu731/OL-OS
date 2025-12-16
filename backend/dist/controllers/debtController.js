"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDebt = exports.toggleDebtStatus = exports.addDebt = exports.getDebts = void 0;
const Debt_1 = __importDefault(require("../models/Debt"));
// @desc    Get all debts/loans
// @route   GET /api/v1/finance/debts
// @access  Private
const getDebts = async (req, res) => {
    try {
        const debts = await Debt_1.default.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(debts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDebts = getDebts;
// @desc    Add a debt/loan record
// @route   POST /api/v1/finance/debts
// @access  Private
const addDebt = async (req, res) => {
    try {
        const { type, person, amount, dueDate, notes } = req.body;
        const debt = await Debt_1.default.create({
            user: req.user.id,
            type,
            person,
            amount,
            dueDate,
            notes
        });
        res.status(201).json(debt);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addDebt = addDebt;
// @desc    Toggle settled status
// @route   PUT /api/v1/finance/debts/:id
// @access  Private
const toggleDebtStatus = async (req, res) => {
    try {
        const debt = await Debt_1.default.findById(req.params.id);
        if (!debt)
            return res.status(404).json({ message: 'Record not found' });
        if (debt.user.toString() !== req.user.id)
            return res.status(401).json({ message: 'Not authorized' });
        debt.isSettled = !debt.isSettled;
        await debt.save();
        res.status(200).json(debt);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.toggleDebtStatus = toggleDebtStatus;
// @desc    Delete debt record
// @route   DELETE /api/v1/finance/debts/:id
// @access  Private
const deleteDebt = async (req, res) => {
    try {
        const debt = await Debt_1.default.findById(req.params.id);
        if (!debt)
            return res.status(404).json({ message: 'Record not found' });
        if (debt.user.toString() !== req.user.id)
            return res.status(401).json({ message: 'Not authorized' });
        await debt.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteDebt = deleteDebt;
