"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financeController_1 = require("../controllers/financeController");
const debtController_1 = require("../controllers/debtController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.protect, financeController_1.getTransactions)
    .post(authMiddleware_1.protect, financeController_1.addTransaction);
router.route('/summary').get(authMiddleware_1.protect, financeController_1.getFinanceSummary);
// Goals
router.route('/goals')
    .get(authMiddleware_1.protect, financeController_1.getGoals)
    .post(authMiddleware_1.protect, financeController_1.addGoal);
router.route('/goals/:id')
    .put(authMiddleware_1.protect, financeController_1.updateGoal)
    .delete(authMiddleware_1.protect, financeController_1.deleteGoal);
// Budgets
router.route('/budgets')
    .get(authMiddleware_1.protect, financeController_1.getBudgets)
    .post(authMiddleware_1.protect, financeController_1.addBudget);
router.route('/budgets/:id')
    .delete(authMiddleware_1.protect, financeController_1.deleteBudget);
router.route('/debts')
    .get(authMiddleware_1.protect, debtController_1.getDebts)
    .post(authMiddleware_1.protect, debtController_1.addDebt);
router.route('/debts/:id')
    .put(authMiddleware_1.protect, debtController_1.toggleDebtStatus)
    .delete(authMiddleware_1.protect, debtController_1.deleteDebt);
router.route('/:id')
    .delete(authMiddleware_1.protect, financeController_1.deleteTransaction);
exports.default = router;
