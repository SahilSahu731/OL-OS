"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduledJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const emailService_1 = require("./emailService");
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
            if (tasks.length > 0 && admin.email) {
                const html = (0, emailService_1.generateDailyBrief)(tasks);
                await (0, emailService_1.sendEmail)(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
    // 2. DAILY END: 9:00 PM - Evening Check-in
    node_cron_1.default.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            if (admin.email) {
                // Potential future expansion: Summary of what was done today
                await (0, emailService_1.sendEmail)(admin.email, `EVENING CHECK :: ${new Date().toLocaleDateString()}`, `<div style="font-family: monospace; background: #000; color: #0f0; padding: 20px;">
                        <h1>// EVENING PROTOCOL //</h1>
                        <p>End of day check-in.</p>
                        <p>Please log all remaining tasks and update your status.</p>
                        <hr style="border-color: #0f0"/>
                        <small>OL-OS Command</small>
                    </div>`);
            }
        }
    });
    // 3. WEEKLY REVIEW: Sunday 9:00 AM - Verification & Updates
    node_cron_1.default.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const admins = await User_1.default.find({ role: 'admin' });
        for (const admin of admins) {
            // Mock Stats (In future, aggregate actual data)
            const stats = {
                xpGained: 1250,
                tasksCompleted: 42,
                completionRate: 91,
                financeNet: 25000
            };
            if (admin.email) {
                const html = (0, emailService_1.generateWeeklyReport)(stats);
                await (0, emailService_1.sendEmail)(admin.email, `WEEKLY UPDATE :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
};
exports.initScheduledJobs = initScheduledJobs;
