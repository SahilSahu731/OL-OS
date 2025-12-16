"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReport = exports.generateDailyBrief = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Transporter (User needs to add env vars)
// For Gmail: Use App Password, not main password
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g. 'plabon.rahman@gmail.com'
        pass: process.env.EMAIL_PASS, // App Password
    },
});
const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Skipping Email: SMTP credentials not set in .env');
        console.log(`[Would have sent to ${to}]: ${subject}`);
        return;
    }
    try {
        const info = await transporter.sendMail({
            from: `"OL-OS Command" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
};
exports.sendEmail = sendEmail;
const generateDailyBrief = (tasks) => {
    const taskList = tasks.map(t => `<li><strong>${t.title}</strong> (${t.difficulty})</li>`).join('');
    return `
    <div style="font-family: monospace; background: #000; color: #0f0; padding: 20px;">
        <h1>// DAILY BRIEFING //</h1>
        <p>Good morning, Commander.</p>
        <p>Here are your objectives for today:</p>
        <ul>${taskList}</ul>
        <br/>
        <p>Stay focused.</p>
        <hr style="border-color: #0f0"/>
        <small>OL-OS System Notification</small>
    </div>
    `;
};
exports.generateDailyBrief = generateDailyBrief;
const generateWeeklyReport = (stats) => {
    return `
    <div style="font-family: monospace; background: #000; color: #ff0; padding: 20px;">
        <h1>// WEEKLY SYSTEM AUDIT //</h1>
        <p>System status report for the past 7 days.</p>
        
        <table style="width: 100%; border: 1px solid #333; color: #fff;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333;">XP Gained</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #0f0;">+${stats.xpGained}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333;">Tasks Completed</td>
                <td style="padding: 10px; border-bottom: 1px solid #333;">${stats.tasksCompleted}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333;">Completion Rate</td>
                <td style="padding: 10px; border-bottom: 1px solid #333;">${stats.completionRate}%</td>
            </tr>
            <tr>
                <td style="padding: 10px;">Financial Net</td>
                <td style="padding: 10px; color: ${stats.financeNet >= 0 ? '#0f0' : '#f00'};">${stats.financeNet}</td>
            </tr>
        </table>
        
        <br/>
        <p>End of Line.</p>
        <hr style="border-color: #ff0"/>
        <small>OL-OS System Notification</small>
    </div>
    `;
};
exports.generateWeeklyReport = generateWeeklyReport;
