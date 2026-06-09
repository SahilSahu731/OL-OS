"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/stores/contentStore";
import { useTaskStore } from "@/stores/taskStore";
import { useWidgetStore } from "@/stores/widgetStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { widgetRegistryById } from "./widgetRegistry";

interface WidgetDockProps {
  isOpen: boolean;
}

export function WidgetDock({ isOpen }: WidgetDockProps) {
  const { enabledWidgetIds, widgetOrder, setCustomizerOpen, resetWidgets } =
    useWidgetStore();
  const { fetchMetrics } = useTaskStore();
  const { fetchRoutines } = useWorkoutStore();
  const { fetchContents } = useContentStore();

  useEffect(() => {
    if (!isOpen) return;

    fetchMetrics(
      format(new Date(), "yyyy-MM-dd"),
      format(new Date(), "yyyy-MM-dd")
    );
    fetchRoutines();
    fetchContents();
  }, [isOpen, fetchMetrics, fetchRoutines, fetchContents]);

  const visibleWidgets = widgetOrder
    .filter((id) => enabledWidgetIds.includes(id))
    .map((id) => widgetRegistryById[id])
    .filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      {visibleWidgets.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">
            No widgets enabled.
          </p>
          <p className="max-w-48 text-xs text-muted-foreground">
            Restore the default OS overlay to bring your system panels back.
          </p>
          <Button size="sm" onClick={resetWidgets}>
            Reset Widgets
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleWidgets.map((widget, index) => {
            const WidgetComponent = widget.component;

            return (
              <div key={widget.id}>
                <WidgetComponent />
                {index < visibleWidgets.length - 1 && (
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-6" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-6 w-full"
        onClick={() => setCustomizerOpen(true)}
      >
        Customize Widgets
      </Button>
    </div>
  );
}
