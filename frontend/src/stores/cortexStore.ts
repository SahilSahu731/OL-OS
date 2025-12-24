import { create } from 'zustand';

interface CortexStore {
    isOpen: boolean;
    toggle: () => void;
    setOpen: (open: boolean) => void;
}

export const useCortexStore = create<CortexStore>((set) => ({
    isOpen: false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (open) => set({ isOpen: open }),
}));
