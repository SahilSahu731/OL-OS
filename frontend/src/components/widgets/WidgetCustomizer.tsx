"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useWidgetStore } from "@/stores/widgetStore";
import { widgetRegistryById } from "./widgetRegistry";

export function WidgetCustomizer() {
  const {
    enabledWidgetIds,
    isCustomizerOpen,
    reorderWidgets,
    resetWidgets,
    setCustomizerOpen,
    toggleWidget,
    widgetOrder,
  } = useWidgetStore();

  const orderedWidgets = widgetOrder
    .map((id) => widgetRegistryById[id])
    .filter(Boolean);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    reorderWidgets(result.source.index, result.destination.index);
  };

  return (
    <Dialog open={isCustomizerOpen} onOpenChange={setCustomizerOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Customize Widget Dock</DialogTitle>
          <DialogDescription>
            Choose which OS widgets stay visible and drag them into your
            preferred order.
          </DialogDescription>
        </DialogHeader>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widget-order">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {orderedWidgets.map((widget, index) => {
                  const isEnabled = enabledWidgetIds.includes(widget.id);
                  const isOnlyEnabled =
                    isEnabled && enabledWidgetIds.length === 1;
                  const Icon = widget.icon;

                  return (
                    <Draggable
                      key={widget.id}
                      draggableId={widget.id}
                      index={index}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors",
                            !isEnabled && "opacity-60",
                            snapshot.isDragging &&
                              "border-primary shadow-lg ring-1 ring-primary/20"
                          )}
                        >
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            {...dragProvided.dragHandleProps}
                            aria-label={`Reorder ${widget.title}`}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-none">
                              {widget.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {widget.description}
                            </p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            disabled={isOnlyEnabled}
                            onCheckedChange={() => toggleWidget(widget.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            className="gap-2"
            onClick={resetWidgets}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
          <Button onClick={() => setCustomizerOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
