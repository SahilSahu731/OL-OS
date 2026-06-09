import cron from 'node-cron';
import User from '../models/User';
import Task from '../models/Task';
import TaskLog from '../models/TaskLog';
import DailyMetric from '../models/DailyMetric';
import { sendEmail, generateDailyBrief, generateWeeklyReport, generateDailyCheckIn, generateMonthlyBackupReport, generateDailyReport } from './emailService';

const REPORT_TIME_ZONE =
    process.env.REPORT_TIME_ZONE || process.env.CRON_TIME_ZONE || process.env.TZ || 'Asia/Kolkata';
const CRON_OPTIONS = { timezone: REPORT_TIME_ZONE };

const toDateString = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: REPORT_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
};

const addDays = (date: Date, amount: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};

const getCompletedTaskIdsForDate = async (userId: any, date: string) => {
    const month = date.substring(0, 7);
    const day = Number(date.substring(8, 10));
    const logs = await TaskLog.find({ user: userId, month });
    const completedTaskIds = new Set<string>();

    logs.forEach((log: any) => {
        if (log.completedDays.includes(day)) {
            completedTaskIds.add(log.task.toString());
        }
    });

    return completedTaskIds;
};

const buildDailyReport = async (user: any, date: string) => {
    const tasks = await Task.find({ user: user._id, active: true });
    const completedTaskIds = await getCompletedTaskIdsForDate(user._id, date);
    const metric = await DailyMetric.findOne({ user: user._id, date });
    const completedHabits = tasks.filter((task: any) =>
        completedTaskIds.has(task._id.toString())
    );
    const missedHabits = tasks.filter((task: any) =>
        !completedTaskIds.has(task._id.toString())
    );
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

const average = (values: number[]) => {
    const valid = values.filter((value) => Number.isFinite(value) && value > 0);
    if (!valid.length) return 0;
    return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1));
};

const buildWeeklyReport = async (user: any, endDate: Date) => {
    const dates = Array.from({ length: 7 }, (_, index) =>
        toDateString(addDays(endDate, index - 6))
    );
    const tasks = await Task.find({ user: user._id, active: true });
    const metrics = await DailyMetric.find({
        user: user._id,
        date: { $gte: dates[0], $lte: dates[dates.length - 1] }
    });
    const reports = await Promise.all(dates.map((date) => buildDailyReport(user, date)));
    const totalHabitSlots = reports.reduce((sum, report) => sum + report.totalHabits, 0);
    const completedHabits = reports.reduce((sum, report) => sum + report.completedHabits, 0);
    const bestReport = reports.reduce((best, report) =>
        report.score > best.score ? report : best,
        reports[0]
    );

    return {
        activeHabits: tasks.length,
        completedHabits,
        totalHabitSlots,
        completionRate: totalHabitSlots
            ? Math.round((completedHabits / totalHabitSlots) * 100)
            : 0,
        avgWeight: average(metrics.map((metric: any) => metric.weight)),
        avgHp: average(metrics.map((metric: any) => metric.hp)),
        avgCalories: average(metrics.map((metric: any) => metric.calories)),
        metricDays: metrics.length,
        bestDay: bestReport?.date,
    };
};

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
             // Always send providing there is a user to send to, even if no tasks (template handles empty case gracefully)
             if (admin.email) {
                 const html = generateDailyBrief(tasks);
                 await sendEmail(admin.email, `MORNING BRIEF :: ${new Date().toLocaleDateString()}`, html);
             }
        }
    }, CRON_OPTIONS);

    // 2. DAILY END: 9:00 PM - Evening Check-in (Fitness, Habit, Nutrition)
    cron.schedule('0 21 * * *', async () => {
        console.log('Running Evening Check-in Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            if (admin.email) {
                const html = generateDailyCheckIn();
                await sendEmail(admin.email, `EVENING CHECK :: ${new Date().toLocaleDateString()}`, html);
            }
        }
    }, CRON_OPTIONS);

    // 3. DAILY REPORT: 9:30 PM - Score, body metrics, sleep/HP, nutrition
    cron.schedule('30 21 * * *', async () => {
        console.log('Running Daily Report Job...');
        const users = await User.find({ email: { $exists: true, $ne: '' } });
        const date = toDateString(new Date());

        for (const user of users) {
            const report = await buildDailyReport(user, date);
            const html = generateDailyReport(report);
            await sendEmail(user.email, `DAILY REPORT :: ${date}`, html);
        }
    }, CRON_OPTIONS);

    // 4. WEEKLY REVIEW: Sunday 9:00 AM - real habit and body metric audit
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running Weekly Review Job...');
        const users = await User.find({ email: { $exists: true, $ne: '' } });

        for (const user of users) {
            const stats = await buildWeeklyReport(user, new Date());
            const html = generateWeeklyReport(stats);
            await sendEmail(user.email, `WEEKLY UPDATE :: ${toDateString(new Date())}`, html);
        }
    }, CRON_OPTIONS);

    // 5. MONTHLY BACKUP: 1st of Month 4:00 AM
    cron.schedule('0 4 1 * *', async () => {
        console.log('Running Monthly Backup Job...');
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
             if (admin.email) {
                 const html = generateMonthlyBackupReport();
                 await sendEmail(admin.email, `SYSTEM BACKUP :: ${new Date().toLocaleDateString()}`, html);
             }
        }
    }, CRON_OPTIONS);
};
