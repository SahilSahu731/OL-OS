"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinanceSummary = exports.deleteTransaction = exports.addTransaction = exports.getTransactions = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
// @desc    Get all transactions for a user
// @route   GET /api/v1/finance
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction_1.default.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTransactions = getTransactions;
// @desc    Add a transaction
// @route   POST /api/v1/finance
// @access  Private
const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, date, description } = req.body;
        if (!type || !amount) {
            res.status(400).json({ message: 'Type and amount are required' });
            return;
        }
        const transaction = await Transaction_1.default.create({
            user: req.user.id,
            type,
            amount,
            category,
            date: date || Date.now(),
            description
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addTransaction = addTransaction;
// @desc    Delete a transaction
// @route   DELETE /api/v1/finance/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction_1.default.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        if (transaction.user.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        await transaction.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteTransaction = deleteTransaction;
// @desc    Get Finance Summary (Balance, Income, Expense)
// @route   GET /api/v1/finance/summary
// @access  Private
const getFinanceSummary = async (req, res) => {
    try {
        const transactions = await Transaction_1.default.find({ user: req.user.id });
        let income = 0;
        let expense = 0;
        transactions.forEach((t) => {
            if (t.type === 'income')
                income += t.amount;
            else
                expense += t.amount;
        });
        res.status(200).json({
            balance: income - expense,
            totalIncome: income,
            totalExpense: expense
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getFinanceSummary = getFinanceSummary;
