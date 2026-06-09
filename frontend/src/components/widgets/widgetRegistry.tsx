"use client";

import { type ReactNode, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Circle,
  Clock3,
  Dumbbell,
  Moon,
  RefreshCw,
  Sun,
  Utensils,
  Wind,
  Youtube,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ContentActiveWidget } from "@/components/ContentActiveWidget";
import { NowPulse } from "@/components/NowPulse";
import { cn } from "@/lib/utils";
import { useAtmosphereStore } from "@/stores/atmosphereStore";
import { useContentStore } from "@/stores/contentStore";
import { useTaskStore } from "@/stores/taskStore";
import type { WidgetId } from "@/stores/widgetStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { WidgetFrame } from "./WidgetFrame";

const MICRO_DIRECTIVES = [
  { text: "Hydrate: 500ml Water", icon: "💧" },
  { text: "Posture Check: Align Spine", icon: "🧘‍♂️" },
  { text: "Vision Break: 20-20-20 Rule", icon: "👀" },
  { text: "Clear Workspace: Zero Clutter", icon: "🧹" },
  { text: "Deep Breath: 4-7-8 Pattern", icon: "🌬️" },
  { text: "Stretch: Stand & Reach", icon: "🧍" },
  { text: "Mindfulness: 60s Silence", icon: "🧠" },
];

interface WidgetDefinition {
  id: WidgetId;
  title: string;
  description: string;
  icon: LucideIcon;
  component: () => ReactNode;
  defaultEnabled: boolean;
  defaultOrder: number;
}

function AtmosphereWidget() {
  const { mode: atmosphere, setMode: setAtmosphere } = useAtmosphereStore();

  return (
    <WidgetFrame title="Atmosphere" icon={Wind}>
      <div
        className={cn(
          "rounded-xl p-5 relative overflow-hidden transition-all duration-500 border border-white/5",
          atmosphere === "focus"
            ? "bg-indigo-950/50 from-indigo-900/50 to-blue-900/50"
            : atmosphere === "energy"
            ? "bg-amber-950/50 from-amber-900/50 to-orange-900/50"
            : "bg-emerald-950/50 from-emerald-900/50 to-teal-900/50"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-50 transition-all duration-500",
            atmosphere === "focus"
              ? "from-indigo-500/20 to-blue-500/20"
              : atmosphere === "energy"
              ? "from-amber-500/20 to-orange-500/20"
              : "from-emerald-500/20 to-teal-500/20"
          )}
        />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-black/20 p-1 rounded-lg">
            <button
              onClick={() => setAtmosphere("focus")}
              className={cn(
                "p-2 rounded-md transition-all",
                atmosphere === "focus"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
              title="Deep Focus"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAtmosphere("energy")}
              className={cn(
                "p-2 rounded-md transition-all",
                atmosphere === "energy"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
              title="High Energy"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAtmosphere("zen")}
              className={cn(
                "p-2 rounded-md transition-all",
                atmosphere === "zen"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
              title="Rest & Recovery"
            >
              <Wind className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <h4 className="text-white font-bold text-sm tracking-wide">
              {atmosphere === "focus"
                ? "Deep Focus Protocol"
                : atmosphere === "energy"
                ? "Kinetic Energy Mode"
                : "Zen Restoration"}
            </h4>
            <p className="text-[10px] text-white/50 mt-1">
              {atmosphere === "focus"
                ? "Optimizing cognitive load."
                : atmosphere === "energy"
                ? "Maximizing output velocity."
                : "Reducing system entropy."}
            </p>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}

function NowPulseWidget() {
  return (
    <WidgetFrame title="Now Pulse" icon={Clock3}>
      <NowPulse variant="dock" />
    </WidgetFrame>
  );
}

function NutritionWidget() {
  const { metrics } = useTaskStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysMetrics = metrics[todayStr] || {};
  const calories = todaysMetrics.calories || 0;
  const protein = todaysMetrics.macros?.protein || 0;
  const targetCalories = 2500;

  return (
    <WidgetFrame title="Bio-Fuel Status" icon={Utensils}>
      <div className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white tracking-tight tabular-nums">
                  {calories}
                </span>
                <span className="text-xs font-bold text-zinc-500 uppercase">
                  kcal
                </span>
              </div>
              <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1">
                {Math.round((calories / targetCalories) * 100)}% of Daily Load
              </div>
            </div>
            <div className="h-10 w-10 rounded-full border-4 border-zinc-800 border-t-orange-500 flex items-center justify-center bg-zinc-900/50 shadow-inner">
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
          </div>

          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-orange-600 via-orange-500 to-yellow-400 transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (calories / targetCalories) * 100)}%`,
              }}
            />
            <div className="absolute top-0 left-[33%] h-full w-px bg-black/20" />
            <div className="absolute top-0 left-[66%] h-full w-px bg-black/20" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full bg-red-500/10 h-[40%] transition-all group-hover:h-full group-hover:bg-red-500/20" />
              <div className="text-lg font-black text-red-400 relative z-10">
                {protein}g
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative z-10">
                Protein
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full bg-blue-500/10 h-[60%] transition-all group-hover:h-full group-hover:bg-blue-500/20" />
              <div className="text-lg font-black text-blue-400 relative z-10">
                {todaysMetrics.macros?.carbs || 0}g
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative z-10">
                Carbs
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full bg-yellow-500/10 h-[30%] transition-all group-hover:h-full group-hover:bg-yellow-500/20" />
              <div className="text-lg font-black text-yellow-400 relative z-10">
                {todaysMetrics.macros?.fats || 0}g
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative z-10">
                Fats
              </div>
            </div>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}

function TrainingWidget() {
  const { routines } = useWorkoutStore();
  const activeRoutine = routines.find((r) =>
    r.days.includes(format(new Date(), "EEE"))
  );

  return (
    <WidgetFrame title="Training Protocol" icon={Dumbbell}>
      <div className="p-4 bg-linear-to-br from-zinc-900 to-black text-white rounded-lg border border-zinc-800">
        {activeRoutine ? (
          <>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg">{activeRoutine.name}</h4>
              <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                Today
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              {activeRoutine.exercises.length} Exercises Scheduled
            </p>
            <Button
              size="sm"
              className="w-full bg-white text-black hover:bg-zinc-200 uppercase font-bold text-xs"
            >
              Execute Workout
            </Button>
          </>
        ) : (
          <div className="text-center py-2 text-zinc-400">
            <p className="text-sm font-medium">Rest Day Designated</p>
            <p className="text-xs opacity-50 mt-1">Recovery is growth.</p>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}

function TacticalQueueWidget() {
  const { tasks, logs, toggleLog } = useTaskStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const queueTasks = tasks
    .filter((t) => t.active)
    .filter((t) => !logs[`${t._id}-${todayStr}`])
    .slice(0, 5);

  return (
    <WidgetFrame
      title="Tactical Queue"
      icon={Zap}
      action={<span className="text-zinc-600">{queueTasks.length} PENDING</span>}
    >
      <div className="space-y-2">
        {queueTasks.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <p className="text-xs text-muted-foreground">
              All systems nominal. Queue empty.
            </p>
          </div>
        ) : (
          queueTasks.map((task) => (
            <div
              key={task._id}
              className="group flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => toggleLog(task._id, todayStr)}
                className="mt-0.5 text-zinc-400 hover:text-green-500 transition-colors"
              >
                <Circle className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {task.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      task.difficulty === "Hard"
                        ? "bg-red-500"
                        : task.difficulty === "Medium"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    )}
                  />
                  {task.difficulty} Priority
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
          ))
        )}
      </div>
    </WidgetFrame>
  );
}

function ContentPipelineWidget() {
  const { contents } = useContentStore();
  const activeContent = contents.filter((c) =>
    ["scripting", "filming", "editing"].includes(c.status)
  );
  const pendingContent = contents
    .filter((c) => c.status === "idea" || c.status === "scheduled")
    .slice(0, 3);

  return (
    <WidgetFrame title="Content Pipeline" icon={Youtube}>
      {activeContent.length > 0 && (
        <div className="mb-4">
          <ContentActiveWidget item={activeContent[0]} compact={true} />
        </div>
      )}
      <div className="space-y-2">
        {pendingContent.map((c) => (
          <div
            key={c._id}
            className="text-xs p-2 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 flex justify-between items-center"
          >
            <span className="truncate max-w-[150px] font-medium">
              {c.title}
            </span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                c.status === "idea"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-purple-500/10 text-purple-500"
              )}
            >
              {c.status}
            </span>
          </div>
        ))}
        {pendingContent.length === 0 && activeContent.length === 0 && (
          <p className="text-xs text-muted-foreground italic pl-2">
            No pending content.
          </p>
        )}
      </div>
    </WidgetFrame>
  );
}

function SynchronicityWidget() {
  const [directive, setDirective] = useState<{
    text: string;
    icon: string;
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const generateDirective = () => {
    setIsSpinning(true);
    setDirective(null);
    setTimeout(() => {
      const random =
        MICRO_DIRECTIVES[Math.floor(Math.random() * MICRO_DIRECTIVES.length)];
      setDirective(random);
      setIsSpinning(false);
    }, 800);
  };

  return (
    <WidgetFrame title="Synchronicity Engine" icon={RefreshCw}>
      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
        {!directive ? (
          <div className="py-2">
            <Button
              size="lg"
              className={cn(
                "w-full transition-all duration-500",
                isSpinning ? "opacity-50 scale-95" : ""
              )}
              onClick={generateDirective}
              disabled={isSpinning}
            >
              {isSpinning ? "Calibrating..." : "Generate Directive"}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">
              Activate random micro-optimization.
            </p>
          </div>
        ) : (
          <div className="animate-in zoom-in slide-in-from-bottom-2 duration-300">
            <div className="text-4xl mb-2">{directive.icon}</div>
            <h4 className="font-bold text-lg">{directive.text}</h4>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
              onClick={() => setDirective(null)}
            >
              <Check className="w-4 h-4" /> Complete
            </Button>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}

export const widgetRegistry: WidgetDefinition[] = [
  {
    id: "nowPulse",
    title: "Now Pulse",
    description: "Live guidance for the current habit time block.",
    icon: Clock3,
    component: NowPulseWidget,
    defaultEnabled: true,
    defaultOrder: 0,
  },
  {
    id: "atmosphere",
    title: "Atmosphere",
    description: "Switch focus, energy, and zen system modes.",
    icon: Wind,
    component: AtmosphereWidget,
    defaultEnabled: true,
    defaultOrder: 1,
  },
  {
    id: "nutrition",
    title: "Bio-Fuel Status",
    description: "Show today’s calorie and macro telemetry.",
    icon: Utensils,
    component: NutritionWidget,
    defaultEnabled: true,
    defaultOrder: 2,
  },
  {
    id: "training",
    title: "Training Protocol",
    description: "Surface today’s routine or recovery state.",
    icon: Dumbbell,
    component: TrainingWidget,
    defaultEnabled: true,
    defaultOrder: 3,
  },
  {
    id: "tacticalQueue",
    title: "Tactical Queue",
    description: "Keep the next incomplete active tasks close.",
    icon: Zap,
    component: TacticalQueueWidget,
    defaultEnabled: true,
    defaultOrder: 4,
  },
  {
    id: "contentPipeline",
    title: "Content Pipeline",
    description: "Track active and pending content work.",
    icon: Youtube,
    component: ContentPipelineWidget,
    defaultEnabled: true,
    defaultOrder: 5,
  },
  {
    id: "synchronicity",
    title: "Synchronicity Engine",
    description: "Generate a small optimization directive.",
    icon: RefreshCw,
    component: SynchronicityWidget,
    defaultEnabled: true,
    defaultOrder: 6,
  },
];

export const widgetRegistryById = widgetRegistry.reduce(
  (acc, widget) => {
    acc[widget.id] = widget;
    return acc;
  },
  {} as Record<WidgetId, WidgetDefinition>
);
