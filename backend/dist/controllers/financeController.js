"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinanceSummary = exports.deleteTransaction = exports.addTransaction = exports.getTransactions = exports.deleteBudget = exports.addBudget = exports.getBudgets = exports.deleteGoal = exports.updateGoal = exports.addGoal = exports.getGoals = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Goal_1 = __importDefault(require("../models/Goal"));
const Budget_1 = __importDefault(require("../models/Budget"));
// ... (Existing Functions: getTransactions, addTransaction, deleteTransaction, getFinanceSummary) ...
// --- GOALS ---
// @desc    Get user goals
// @route   GET /api/v1/finance/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const goals = await Goal_1.default.find({ user: req.user.id }).sort({ deadline: 1 });
        res.status(200).json(goals);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getGoals = getGoals;
// @desc    Add a goal
// @route   POST /api/v1/finance/goals
// @access  Private
const addGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, color, currentAmount } = req.body;
        const goal = await Goal_1.default.create({
            user: req.user.id,
            title,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline,
            color
        });
        res.status(201).json(goal);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addGoal = addGoal;
// @desc    Update a goal (contribution or edit)
// @route   PUT /api/v1/finance/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal_1.default.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user.id) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        const updatedGoal = await Goal_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedGoal);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateGoal = updateGoal;
// @desc    Delete a goal
// @route   DELETE /api/v1/finance/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal_1.default.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user.id) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        await goal.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteGoal = deleteGoal;
// --- BUDGETS ---
// @desc    Get budgets
// @route   GET /api/v1/finance/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget_1.default.find({ user: req.user.id });
        res.status(200).json(budgets);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getBudgets = getBudgets;
// @desc    Add a budget
// @route   POST /api/v1/finance/budgets
// @access  Private
const addBudget = async (req, res) => {
    try {
        const { category, limit, period } = req.body;
        const budget = await Budget_1.default.create({
            user: req.user.id,
            category,
            limit,
            period
        });
        res.status(201).json(budget);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addBudget = addBudget;
// @desc    Delete a budget
// @route   DELETE /api/v1/finance/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget_1.default.findById(req.params.id);
        if (!budget || budget.user.toString() !== req.user.id) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }
        await budget.deleteOne();
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteBudget = deleteBudget;
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
