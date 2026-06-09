"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetDock } from "@/components/widgets/WidgetDock";
import { useWidgetStore } from "@/stores/widgetStore";

export function RightSidebar({
  isOpen,
  onClose,
  width,
  onWidthChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  onWidthChange: (w: number) => void;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const setCustomizerOpen = useWidgetStore((state) => state.setCustomizerOpen);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  if (!isOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className="fixed inset-y-0 right-0 z-50 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-w-full"
      style={{ width: `min(${width}px, 100vw)` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 hidden w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50 md:block"
        onMouseDown={startResizing}
      />

      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Widget Dock
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCustomizerOpen(true)}
            title="Customize widgets"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            title="Close dock"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <WidgetDock isOpen={isOpen} />
    </div>
  );
}
