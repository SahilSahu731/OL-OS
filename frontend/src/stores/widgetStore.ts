import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WidgetId =
  | "nowPulse"
  | "atmosphere"
  | "nutrition"
  | "training"
  | "tacticalQueue"
  | "contentPipeline"
  | "synchronicity";

export const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  "nowPulse",
  "atmosphere",
  "nutrition",
  "training",
  "tacticalQueue",
  "contentPipeline",
  "synchronicity",
];

export const DEFAULT_ENABLED_WIDGET_IDS: WidgetId[] = [...DEFAULT_WIDGET_ORDER];

const normalizeWidgetOrder = (order: WidgetId[]) => {
  const known = order.filter((id): id is WidgetId =>
    DEFAULT_WIDGET_ORDER.includes(id)
  );
  const missing = DEFAULT_WIDGET_ORDER.filter((id) => !known.includes(id));

  return [...known, ...missing];
};

const normalizeEnabledWidgets = (enabledWidgetIds: WidgetId[]) => {
  const known = enabledWidgetIds.filter((id): id is WidgetId =>
    DEFAULT_WIDGET_ORDER.includes(id)
  );

  return known.length > 0 ? known : [...DEFAULT_ENABLED_WIDGET_IDS];
};

interface WidgetState {
  isDockOpen: boolean;
  dockWidth: number;
  isCustomizerOpen: boolean;
  enabledWidgetIds: WidgetId[];
  widgetOrder: WidgetId[];
  setDockOpen: (open: boolean) => void;
  toggleDock: () => void;
  setDockWidth: (width: number) => void;
  setCustomizerOpen: (open: boolean) => void;
  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  resetWidgets: () => void;
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      isDockOpen: true,
      dockWidth: 300,
      isCustomizerOpen: false,
      enabledWidgetIds: [...DEFAULT_ENABLED_WIDGET_IDS],
      widgetOrder: [...DEFAULT_WIDGET_ORDER],
      setDockOpen: (isDockOpen) => set({ isDockOpen }),
      toggleDock: () =>
        set((state) => ({
          isDockOpen: !state.isDockOpen,
        })),
      setDockWidth: (dockWidth) =>
        set({
          dockWidth: Math.min(600, Math.max(240, dockWidth)),
        }),
      setCustomizerOpen: (isCustomizerOpen) => set({ isCustomizerOpen }),
      toggleWidget: (id) => {
        const enabledWidgetIds = get().enabledWidgetIds;
        const isEnabled = enabledWidgetIds.includes(id);

        if (isEnabled && enabledWidgetIds.length === 1) {
          return;
        }

        set({
          enabledWidgetIds: isEnabled
            ? enabledWidgetIds.filter((widgetId) => widgetId !== id)
            : [...enabledWidgetIds, id],
        });
      },
      reorderWidgets: (fromIndex, toIndex) => {
        const widgetOrder = [...get().widgetOrder];
        const [moved] = widgetOrder.splice(fromIndex, 1);

        if (!moved) return;

        widgetOrder.splice(toIndex, 0, moved);
        set({ widgetOrder });
      },
      resetWidgets: () =>
        set({
          isDockOpen: true,
          dockWidth: 300,
          enabledWidgetIds: [...DEFAULT_ENABLED_WIDGET_IDS],
          widgetOrder: [...DEFAULT_WIDGET_ORDER],
        }),
    }),
    {
      name: "widget-dock-storage",
      partialize: (state) => ({
        isDockOpen: state.isDockOpen,
        dockWidth: state.dockWidth,
        enabledWidgetIds: state.enabledWidgetIds,
        widgetOrder: state.widgetOrder,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<WidgetState> | undefined;
        const persistedWidgetOrder =
          persisted?.widgetOrder ?? currentState.widgetOrder;
        const persistedEnabledWidgetIds =
          persisted?.enabledWidgetIds ?? currentState.enabledWidgetIds;
        const isAddingNowPulse = !persistedWidgetOrder.includes("nowPulse");
        const enabledWidgetIds = normalizeEnabledWidgets(
          persistedEnabledWidgetIds
        );

        return {
          ...currentState,
          ...persisted,
          dockWidth: Math.min(
            600,
            Math.max(240, persisted?.dockWidth ?? currentState.dockWidth)
          ),
          enabledWidgetIds: isAddingNowPulse
            ? Array.from(new Set<WidgetId>(["nowPulse", ...enabledWidgetIds]))
            : enabledWidgetIds,
          widgetOrder: normalizeWidgetOrder(persistedWidgetOrder),
        };
      },
    }
  )
);
