import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Challenge {
    _id?: string;
    title: string;
    description: string;
    icon: string;
    theme: 'red' | 'gold' | 'blue' | 'purple' | 'obsidian';
    daysTotal: number;
    daysCompleted: number; 
    status: 'active' | 'completed' | 'failed' | 'available';
    // Advanced
    mode: 'standard' | 'hardcore';
    allowedStrikes: number;
    currentStrikes: number;
    stakes: string;
    
    rules: { text: string; type: 'boolean' | 'numeric' }[];
    logs: ChallengeLog[];
    participants: number;
    createdAt?: string;
}

export interface ChallengeLog {
    date: string;
    completed: boolean;
    reflection?: {
        question: string;
        answer: string;
    };
    checklist?: boolean[];
}

interface ChallengeStore {
    challenges: Challenge[];
    isLoading: boolean;
    error: string | null;
    fetchChallenges: () => Promise<void>;
    createChallenge: (data: Partial<Challenge>) => Promise<void>;
    updateChallenge: (id: string, data: Partial<Challenge>) => Promise<void>;
    logProgress: (id: string, data: any) => Promise<void>;
    failChallenge: (id: string) => Promise<void>; 
    deleteChallenge: (id: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
    challenges: [],
    isLoading: false,
    error: null,

    fetchChallenges: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.get(`${API_URL}/challenges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const enhanced = res.data.map((c: any) => ({
                ...c,
                daysCompleted: c.logs.filter((l: any) => l.completed).length,
                heatmap: calculateHeatmap(c.logs)
            }));
            set({ challenges: enhanced, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch challenges', isLoading: false });
        }
    },

    createChallenge: async (data) => {
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.post(`${API_URL}/challenges`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newChallenge = { ...res.data, daysCompleted: 0, logs: [] };
            set(state => ({ challenges: [newChallenge, ...state.challenges] }));
        } catch (error) {
            console.error(error);
        }
    },

    updateChallenge: async (id, data) => {
         try {
            const token = useAuthStore.getState().token;
            const res = await axios.put(`${API_URL}/challenges/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                challenges: state.challenges.map(c => c._id === id ? { ...c, ...res.data } : c)
            }));
        } catch (error) {
            console.error(error);
        }
    },

    logProgress: async (id, payload) => {
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.post(`${API_URL}/challenges/${id}/log`, payload, {
                 headers: { Authorization: `Bearer ${token}` }
            });
             set(state => ({
                challenges: state.challenges.map(c => {
                    if (c._id === id) {
                        // The server response contains the updated challenge object including status change (failed/completed)
                        // We merge that in
                        return { ...c, ...res.data, daysCompleted: res.data.logs.filter((l: any) => l.completed).length, heatmap: calculateHeatmap(res.data.logs) };
                    }
                    return c;
                })
            }));
        } catch (error) {
            console.error(error);
        }
    },

    failChallenge: async (id) => {
        try {
            const token = useAuthStore.getState().token;
            const res = await axios.post(`${API_URL}/challenges/${id}/fail`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                challenges: state.challenges.map(c => c._id === id ? { ...c, status: 'failed', currentStrikes: 100 } : c)
            }));
        } catch (error) {
            console.error(error);
        }
    },

    deleteChallenge: async (id) => {
        try {
            const token = useAuthStore.getState().token;
             await axios.delete(`${API_URL}/challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({ challenges: state.challenges.filter(c => c._id !== id) }));
        } catch (error) {
            console.error(error);
        }
    }
}));

function calculateHeatmap(logs: any[]): string[] {
    const statuses: string[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const log = logs.find((l: any) => l.date && l.date.toString().startsWith(dateStr));
        if (log && log.completed) statuses.push('success');
        else if (log && !log.completed) statuses.push('failed');
        else if (i === 0) statuses.push('pending'); 
        else statuses.push('missed'); // Default to missed if not found and in past
    }
    return statuses;
}
