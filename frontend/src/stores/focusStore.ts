import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusStore {
    // State
    status: 'idle' | 'running' | 'paused';
    startTime: number | null; // When session started initially
    endTime: number | null; // When session is scheduled to end (if running)
    pausedRemainingTime: number | null; // If paused, how much time was left (ms)
    initialDuration: number; // in minutes (for progress calc)
    activeTaskId: string | null;
    
    // Notes/Braindump
    braindump: string;
    updateBraindump: (text: string) => void;

    // Settings
    soundEnabled: boolean;
    soundType: 'rain' | 'forest' | 'white-noise' | 'none';
    
    // Actions
    startSession: (durationMinutes: number, taskId?: string | null) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    stopSession: () => void;
    completeSession: () => void;
    
    setSound: (type: 'rain' | 'forest' | 'white-noise' | 'none') => void;
    toggleSound: () => void;
    
    // Computed (helper for UI, call via hook usually, or we provide a getter?)
    // zustand getters are valid. We will use a tick action to update a 'displayTime' or just derive it in component
}

// We need a derived state for the UI to subscribe to, or just raw data.
// Let's keep it simple: The UI calls `useFocusStore()` and calculates time left based on `endTime - Date.now()`.
// BUT for progress bars we need to force re-renders. 
// So we will keep a `displayTime` that updates on tick? 
// No, simpler: The store holds the "Truth" (endTime). The UI component runs a setInterval that effectively just re-reads the store/Date.now().
// Wait, if we want the store to trigger "Complete", we need a tick in the store or the component.
// The component is safer for "Sound" playback.

interface FocusStoreState extends FocusStore {
    displayTime: number; // seconds, helper for UI to not do math everywhere
    progress: number; // 0-100
    sync: () => void; // Call this from UI interval
}

export const useFocusStore = create<FocusStoreState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      startTime: null,
      endTime: null,
      pausedRemainingTime: null,
      initialDuration: 25,
      activeTaskId: null,
      braindump: '',
      soundEnabled: false,
      soundType: 'none',
      displayTime: 25 * 60,
      progress: 0,

      updateBraindump: (text) => set({ braindump: text }),

      startSession: (durationMinutes, taskId = null) => {
          const now = Date.now();
          const durationMs = durationMinutes * 60 * 1000;
          set({
              status: 'running',
              startTime: now,
              endTime: now + durationMs,
              initialDuration: durationMinutes,
              pausedRemainingTime: null,
              activeTaskId: taskId,
              displayTime: durationMinutes * 60,
              progress: 0
          });
      },

      pauseSession: () => {
          const { status, endTime } = get();
          if (status !== 'running' || !endTime) return;
          const remaining = endTime - Date.now();
          set({
              status: 'paused',
              pausedRemainingTime: remaining,
              endTime: null // Clear end time as it's no longer valid until resume
          });
      },

      resumeSession: () => {
          const { status, pausedRemainingTime } = get();
          if (status !== 'paused' || !pausedRemainingTime) return;
          set({
              status: 'running',
              endTime: Date.now() + pausedRemainingTime,
              pausedRemainingTime: null
          });
      },

      stopSession: () => set({ 
          status: 'idle', 
          startTime: null, 
          endTime: null, 
          pausedRemainingTime: null, 
          activeTaskId: null,
          displayTime: 0,
          progress: 0
      }),
      
      completeSession: () => {
          set({ 
              status: 'idle', 
              startTime: null, 
              endTime: null, 
              pausedRemainingTime: null, 
              activeTaskId: null,
              displayTime: 0,
              progress: 100
          });
      },

      setSound: (type) => set({ soundType: type }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      
      // Called by UI interval
      sync: () => {
          const { status, endTime, startTime, initialDuration, pausedRemainingTime } = get();
          
          if (status === 'idle') {
             // Do nothing or reset
             return;
          }

          if (status === 'paused' && pausedRemainingTime) {
              set({ displayTime: Math.max(0, Math.floor(pausedRemainingTime / 1000)) });
              return;
          }

          if (status === 'running' && endTime) {
              const now = Date.now();
              const remainingMs = endTime - now;
              const totalMs = initialDuration * 60 * 1000;
              
              if (remainingMs <= 0) {
                  // Complete
                  set({ displayTime: 0, progress: 100 });
                  // The UI component observing this will trigger the 'Complete' effect (sound/toast)
                  get().completeSession();
              } else {
                  set({ 
                      displayTime: Math.ceil(remainingMs / 1000),
                      progress: 100 - ((remainingMs / totalMs) * 100)
                  });
              }
          }
      }
    }),
    {
      name: 'focus-storage',
      partialize: (state) => ({ 
          soundEnabled: state.soundEnabled, 
          soundType: state.soundType,
          status: state.status,
          endTime: state.endTime,
          startTime: state.startTime,
          pausedRemainingTime: state.pausedRemainingTime,
          initialDuration: state.initialDuration,
          activeTaskId: state.activeTaskId,
          braindump: state.braindump
      }),
    }
  )
);
