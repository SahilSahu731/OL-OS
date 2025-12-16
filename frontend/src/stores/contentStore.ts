import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5000/api/v1/content';

export interface ContentItem {
  _id?: string;
  title: string;
  platform: 'twitter' | 'instagram' | 'youtube';
  type: 'tweet' | 'thread' | 'reel' | 'post' | 'video' | 'short' | 'story';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published';
  description?: string;
  script?: string;
  tags?: string[];
  scheduledDate?: string;
  publishedDate?: string;
}

interface ContentStore {
  contents: ContentItem[];
  isLoading: boolean;
  fetchContents: () => Promise<void>;
  createContent: (data: Partial<ContentItem>) => Promise<void>;
  updateContent: (id: string, data: Partial<ContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  contents: [],
  isLoading: false,

  fetchContents: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      set({ contents: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch contents error:', error);
      set({ isLoading: false });
    }
  },

  createContent: async (data) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, data, config);
      set((state) => ({ contents: [response.data, ...state.contents] }));
    } catch (error) {
      console.error('Create content error:', error);
    }
  },

  updateContent: async (id, data) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/${id}`, data, config);
      set((state) => ({
        contents: state.contents.map((c) => (c._id === id ? response.data : c)),
      }));
    } catch (error) {
      console.error('Update content error:', error);
    }
  },

  deleteContent: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      set((state) => ({
        contents: state.contents.filter((c) => c._id !== id),
      }));
    } catch (error) {
      console.error('Delete content error:', error);
    }
  },
}));
