import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  updatedAt: string;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  
  fetchNotes: () => Promise<void>;
  createNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/notes`, config);
      set({ notes: response.data, isLoading: false });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ error: error.message, isLoading: false });
    }
  },

  createNote: async (noteData: Partial<Note>) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/notes`, noteData, config);
      set(state => ({ notes: [response.data, ...state.notes] }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
       console.error(error);
    }
  },

  updateNote: async (id: string, noteData: Partial<Note>) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/notes/${id}`, noteData, config);
      set(state => ({ 
        notes: state.notes.map(n => n._id === id ? response.data : n) 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(error);
    }
  },

  deleteNote: async (id: string) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/notes/${id}`, config);
      set(state => ({ 
        notes: state.notes.filter(n => n._id !== id) 
      }));
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(error);
    }
  },
}));
