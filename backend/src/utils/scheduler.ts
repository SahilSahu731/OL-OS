import cron from 'node-cron';
import User from '../models/User';
import Task from '../models/Task';
import TaskLog from '../models/TaskLog';
import { sendEmail, generateDailyBrief, generateWeeklyReport } from './emailService';

// Initialize Cron Jobs
export const initScheduledJobs = () => {
    console.log('Initializing Cron Jobs...');

    // 1. DAILY START: 8:00 AM - Morning Briefing
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Morning Brief Job...');
        // Send to all Admins
        const admins = await User.find({ role: 'admin' });
        
        for (const admin of admins) {
             const tasks = await Task.find({ user: admin._id, active: true });
             if (tasks.length > 0 && admin.email) {
                 const html = generateDailyBrief(tasks);
                 await sendEmail(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
             }
        }
    });

    // 2. DAILY END: 9:00 PM - Evening Check-in
    cron.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            if (admin.email) {
                // Potential future expansion: Summary of what was done today
                await sendEmail(
                    admin.email, 
                    `EVENING CHECK :: ${new Date().toLocaleDateString()}`, 
                    `<div style="font-family: monospace; background: #000; color: #0f0; padding: 20px;">
                        <h1>// EVENING PROTOCOL //</h1>
                        <p>End of day check-in.</p>
                        <p>Please log all remaining tasks and update your status.</p>
                        <hr style="border-color: #0f0"/>
                        <small>OL-OS Command</small>
                    </div>`
                );
            }
        }
    });

    // 3. WEEKLY REVIEW: Sunday 9:00 AM - Verification & Updates
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            // Mock Stats (In future, aggregate actual data)
            const stats = {
                xpGained: 1250, 
                tasksCompleted: 42,
                completionRate: 91,
                financeNet: 25000
            };

            if (admin.email) {
                const html = generateWeeklyReport(stats);
                await sendEmail(admin.email, `WEEKLY UPDATE :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    });
};
