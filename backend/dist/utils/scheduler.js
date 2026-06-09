"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduledJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const TaskLog_1 = __importDefault(require("../models/TaskLog"));
const DailyMetric_1 = __importDefault(require("../models/DailyMetric"));
const emailService_1 = require("./emailService");
const REPORT_TIME_ZONE = process.env.REPORT_TIME_ZONE || process.env.CRON_TIME_ZONE || process.env.TZ || 'Asia/Kolkata';
const CRON_OPTIONS = { timezone: REPORT_TIME_ZONE };
const toDateString = (date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: REPORT_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
};
const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};
const getCompletedTaskIdsForDate = async (userId, date) => {
    const month = date.substring(0, 7);
    const day = Number(date.substring(8, 10));
    const logs = await TaskLog_1.default.find({ user: userId, month });
    const completedTaskIds = new Set();
    logs.forEach((log) => {
        if (log.completedDays.includes(day)) {
            completedTaskIds.add(log.task.toString());
        }
    });
    return completedTaskIds;
};
const buildDailyReport = async (user, date) => {
    const tasks = await Task_1.default.find({ user: user._id, active: true });
    const completedTaskIds = await getCompletedTaskIdsForDate(user._id, date);
    const metric = await DailyMetric_1.default.findOne({ user: user._id, date });
    const completedHabits = tasks.filter((task) => completedTaskIds.has(task._id.toString()));
    const missedHabits = tasks.filter((task) => !completedTaskIds.has(task._id.toString()));
    const score = tasks.length
        ? Math.round((completedHabits.length / tasks.length) * 100)
        : 0;
    return {
        date,
        score,
        totalHabits: tasks.length,
        completedHabits: completedHabits.length,
        missedHabits,
        weight: metric?.weight || 0,
        hp: metric?.hp || 0,
        calories: metric?.calories || 0,
        water: metric?.water || 0,
        macros: metric?.macros || { protein: 0, carbs: 0, fats: 0 },
    };
};
const average = (values) => {
    const valid = values.filter((value) => Number.isFinite(value) && value > 0);
    if (!valid.length)
        return 0;
    return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1));
};
const buildWeeklyReport = async (user, endDate) => {
    const dates = Array.from({ length: 7 }, (_, index) => toDateString(addDays(endDate, index - 6)));
    const tasks = await Task_1.default.find({ user: user._id, active: true });
    const metrics = await DailyMetric_1.default.find({
        user: user._id,
        date: { $gte: dates[0], $lte: dates[dates.length - 1] }
    });
    const reports = await Promise.all(dates.map((date) => buildDailyReport(user, date)));
    const totalHabitSlots = reports.reduce((sum, report) => sum + report.totalHabits, 0);
    const completedHabits = reports.reduce((sum, report) => sum + report.completedHabits, 0);
    const bestReport = reports.reduce((best, report) => report.score > best.score ? report : best, reports[0]);
    return {
        activeHabits: tasks.length,
        completedHabits,
        totalHabitSlots,
        completionRate: totalHabitSlots
            ? Math.round((completedHabits / totalHabitSlots) * 100)
            : 0,
        avgWeight: average(metrics.map((metric) => metric.weight)),
        avgHp: average(metrics.map((metric) => metric.hp)),
        avgCalories: average(metrics.map((metric) => metric.calories)),
        metricDays: metrics.length,
        bestDay: bestReport?.date,
    };
};
// Initialize Cron Jobs
const initScheduledJobs = () => {
    console.log('Initializing Cron Jobs...');
    // 1. DAILY START: 8:00 AM - Morning Briefing
    node_cron_1.default.schedule('0 8 * * *', async () => {
        console.log('Running Morning Brief Job...');
        // Send to all Admins
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            const tasks = await Task_1.default.find({ user: admin._id, active: true });
            // Always send providing there is a user to send to, even if no tasks (template handles empty case gracefully)
            if (admin.email) {
                const html = (0, emailService_1.generateDailyBrief)(tasks);
                await (0, emailService_1.sendEmail)(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    }, CRON_OPTIONS);
    // 2. DAILY END: 9:00 PM - Evening Check-in (Fitness, Habit, Nutrition)
    node_cron_1.default.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            if (admin.email) {
                const html = (0, emailService_1.generateDailyCheckIn)();
                await (0, emailService_1.sendEmail)(admin.email, `EVENING CHECK :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    }, CRON_OPTIONS);
    // 3. DAILY REPORT: 9:30 PM - Score, body metrics, sleep/HP, nutrition
    node_cron_1.default.schedule('30 21 * * *', async () => {
        console.log('Running Daily Report Job...');
        const users = await User_1.default.find({ email: { $exists: true, $ne: '' } });
        const date = toDateString(new Date());
        for (const user of users) {
            const report = await buildDailyReport(user, date);
            const html = (0, emailService_1.generateDailyReport)(report);
            await (0, emailService_1.sendEmail)(user.email, `DAILY REPORT :: ${date}`, html);
        }
    }, CRON_OPTIONS);
    // 4. WEEKLY REVIEW: Sunday 9:00 AM - real habit and body metric audit
    node_cron_1.default.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const users = await User_1.default.find({ email: { $exists: true, $ne: '' } });
        for (const user of users) {
            const stats = await buildWeeklyReport(user, new Date());
            const html = (0, emailService_1.generateWeeklyReport)(stats);
            await (0, emailService_1.sendEmail)(user.email, `WEEKLY UPDATE :: ${toDateString(new Date())}`, html);
        }
    }, CRON_OPTIONS);
    // 5. MONTHLY BACKUP: 1st of Month 4:00 AM
    node_cron_1.default.schedule('0 4 1 * *', async () => {
        console.log('Running Monthly Backup Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            if (admin.email) {
                const html = (0, emailService_1.generateMonthlyBackupReport)();
                await (0, emailService_1.sendEmail)(admin.email, `SYSTEM BACKUP :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    }, CRON_OPTIONS);
};
exports.initScheduledJobs = initScheduledJobs;
