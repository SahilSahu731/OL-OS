import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ExerciseSet {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface Exercise {
  _id?: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  _id: string;
  user: string;
  name: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkoutState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  
  fetchWorkouts: () => Promise<void>;
  createWorkout: (workout: Partial<Workout>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  isLoading: false,
  error: null,

  fetchWorkouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/workouts`, config);
      set({ workouts: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch workouts',
        isLoading: false 
      });
    }
  },

  createWorkout: async (workoutData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/workouts`, workoutData, config);
      set(state => ({ 
        workouts: [response.data, ...state.workouts],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create workout',
        isLoading: false 
      });
      throw error;
    }
  },

  updateWorkout: async (id, workoutData) => {
    // Implementation for update
    set({ isLoading: true, error: null });
    try {
        const token = useAuthStore.getState().token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.put(`${API_URL}/workouts/${id}`, workoutData, config);
        set(state => ({ 
          workouts: state.workouts.map(w => w._id === id ? response.data : w),
          isLoading: false 
        }));
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || 'Failed to update workout',
          isLoading: false 
        });
        throw error;
      }
  },

  deleteWorkout: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${API_URL}/workouts/${id}`, config);
      set(state => ({ 
        workouts: state.workouts.filter(w => w._id !== id),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete workout',
        isLoading: false 
      });
    }
  },
}));
