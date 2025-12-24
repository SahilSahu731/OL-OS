import mongoose, { Schema, Document } from 'mongoose';

export interface IChallengeLog {
    date: Date;
    completed: boolean;
    reflection?: {
        question: string;
        answer: string;
    };
    evidenceUrl?: string;
    checklist?: boolean[];
    numericValue?: number; // e.g. pages read, minutes meditated
}

export interface IChallenge extends Document {
    userId: string;
    title: string;
    description: string;
    icon: string;
    theme: 'red' | 'gold' | 'blue' | 'purple' | 'obsidian';
    
    // Mechanics
    daysTotal: number;
    startDate?: Date;
    status: 'active' | 'completed' | 'failed' | 'available';
    
    // Advanced Features
    mode: 'standard' | 'hardcore'; // Standard = allow strikes, Hardcore = 1 strike & fail
    allowedStrikes: number; 
    currentStrikes: number;
    
    // Psychology
    stakes: string; // "If I fail, I will donate $50 to a charity I hate"
    commitmentLevel: 'casual' | 'serious' | 'fanatic';
    
    rules: {
        text: string;
        type: 'boolean' | 'numeric' | 'time';
        target?: number; // for numeric
    }[];
    
    logs: IChallengeLog[];
    participants: number;
    
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    theme: { type: String, enum: ['red', 'gold', 'blue', 'purple', 'obsidian'], default: 'red' },
    
    daysTotal: { type: Number, required: true },
    startDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'failed', 'available'], default: 'active' },
    
    mode: { type: String, enum: ['standard', 'hardcore'], default: 'standard' },
    allowedStrikes: { type: Number, default: 3 },
    currentStrikes: { type: Number, default: 0 },
    
    stakes: { type: String, default: '' },
    commitmentLevel: { type: String, enum: ['casual', 'serious', 'fanatic'], default: 'serious' },
    
    rules: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['boolean', 'numeric', 'time'], default: 'boolean' },
        target: Number
    }],
    
    logs: [{
        date: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false },
        reflection: {
            question: String,
            answer: String
        },
        evidenceUrl: String,
        checklist: [{ type: Boolean }],
        numericValue: Number
    }],
    
    participants: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
