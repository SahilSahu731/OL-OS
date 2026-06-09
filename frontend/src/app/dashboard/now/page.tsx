"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  Gauge,
  Layers3,
  Loader2,
  Plus,
  Radar,
  RefreshCw,
  Sparkles,
  TimerReset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Task, TimeBlock, useTaskStore } from "@/stores/taskStore";

const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 6];
const HOURS_12 = Array.from({ length: 12 }, (_, index) => `${index + 1}`);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  `${index}`.padStart(2, "0")
);

type Meridiem = "AM" | "PM";

const getMinuteProgress = (date: Date) =>
  Math.round(((date.getHours() * 60 + date.getMinutes()) / 1440) * 100);

const getTimeGradient = (date: Date) => {
  const hour = date.getHours();
  if (hour < 6) return "from-slate-950 via-indigo-950 to-blue-950";
  if (hour < 12) return "from-zinc-950 via-sky-950 to-amber-950";
  if (hour < 18) return "from-zinc-950 via-blue-950 to-slate-950";
  return "from-zinc-950 via-stone-950 to-indigo-950";
};

const getCategoryName = (task: Task) => {
  if (!task.category) return "No category";
  return typeof task.category === "object" ? task.category.name : "Category";
};

const formatDisplayTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return format(date, "h:mm a");
};

const getTimeParts = (time: string) => {
  const [rawHours, rawMinutes] = time.split(":").map(Number);
  const meridiem: Meridiem = rawHours >= 12 ? "PM" : "AM";
  const hour12 = rawHours % 12 || 12;

  return {
    hour: `${hour12}`,
    minute: `${rawMinutes}`.padStart(2, "0"),
    meridiem,
  };
};

const buildTimeValue = (hour: string, minute: string, meridiem: Meridiem) => {
  const hourNumber = Number(hour);
  const normalizedHour =
    meridiem === "PM"
      ? hourNumber === 12
        ? 12
        : hourNumber + 12
      : hourNumber === 12
      ? 0
      : hourNumber;

  return `${`${normalizedHour}`.padStart(2, "0")}:${minute}`;
};

export default function NowPage() {
  const {
    tasks,
    logs,
    nowPlan,
    isLoading,
    fetchTasks,
    fetchLogs,
    fetchNowPlan,
    toggleLog,
    updateTask,
  } = useTaskStore();
  const [now, setNow] = useState(new Date());
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [dialogHabits, setDialogHabits] = useState<Task[]>([]);
  const [habitQuery, setHabitQuery] = useState("");
  const [isHabitPickerOpen, setIsHabitPickerOpen] = useState(false);
  const [isDialogHabitsLoading, setIsDialogHabitsLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([
    ...DEFAULT_DAYS,
  ]);

  const today = format(now, "yyyy-MM-dd");
  const currentTime = format(now, "HH:mm");
  const day = now.getDay();
  const currentKey = nowPlan?.current
    ? `${nowPlan.current.task._id}-${today}`
    : "";
  const isCurrentCompleted = currentKey ? !!logs[currentKey] : false;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchLogs(today, today);
    fetchNowPlan(today, currentTime, day);
  }, [today, currentTime, day, fetchLogs, fetchNowPlan]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const scheduledTaskIds = useMemo(() => {
    return new Set(
      tasks
        .filter((task) => (task.timeBlocks || []).some((block) => block.active !== false))
        .map((task) => task._id)
    );
  }, [tasks]);

  const assignableTasks = useMemo(() => {
    return tasks;
  }, [tasks]);
  const habitOptions = dialogHabits.length > 0 ? dialogHabits : assignableTasks;
  const filteredHabitOptions = habitOptions.filter((task) =>
    task.title.toLowerCase().includes(habitQuery.toLowerCase())
  );
  const effectiveSelectedTaskId = selectedTaskId || habitOptions[0]?._id || "";
  const selectedTask = habitOptions.find(
    (item) => item._id === effectiveSelectedTaskId
  );

  const unscheduledTasks = useMemo(() => {
    return assignableTasks.filter((task) => !scheduledTaskIds.has(task._id));
  }, [assignableTasks, scheduledTaskIds]);

  const loadDialogHabits = async () => {
    setIsDialogHabitsLoading(true);
    try {
      const response = await api.get("/tasks");
      const habits = Array.isArray(response.data) ? response.data : [];
      setDialogHabits(habits);

      if (!selectedTaskId && habits[0]) {
        setSelectedTaskId(habits[0]._id);
        setLabel((currentLabel) => currentLabel || habits[0].title);
      }
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setIsDialogHabitsLoading(false);
    }
  };

  const openAssignDialog = (task?: Task) => {
    setSelectedTaskId(task?._id || assignableTasks[0]?._id || "");
    setLabel(task ? task.title : "");
    setHabitQuery("");
    setIsHabitPickerOpen(false);
    setStartTime(currentTime);
    setEndTime(format(new Date(now.getTime() + 30 * 60 * 1000), "HH:mm"));
    setSelectedDays([...DEFAULT_DAYS]);
    setIsAssignOpen(true);
    void loadDialogHabits();
  };

  const handleHabitChange = (taskId: string) => {
    const nextTask = habitOptions.find((task) => task._id === taskId);
    setSelectedTaskId(taskId);
    setIsHabitPickerOpen(false);
    setHabitQuery("");

    if (nextTask) {
      setLabel((currentLabel) => {
        const previousTitle = selectedTask?.title;
        if (!currentLabel || currentLabel === previousTitle) {
          return nextTask.title;
        }

        return currentLabel;
      });
    }
  };

  const toggleDay = (value: number) => {
    setSelectedDays((current) => {
      if (current.includes(value)) {
        return current.length === 1
          ? current
          : current.filter((dayValue) => dayValue !== value);
      }

      return [...current, value].sort((a, b) => a - b);
    });
  };

  const handleAssignTime = async (event: React.FormEvent) => {
    event.preventDefault();

    const task = habitOptions.find((item) => item._id === effectiveSelectedTaskId);
    if (!task) {
      toast.error("Choose a habit first");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const nextBlock: TimeBlock = {
      label: label.trim() || task.title,
      startTime,
      endTime,
      days: selectedDays,
      active: true,
    };

    try {
      await updateTask(task._id, {
        timeBlocks: [...(task.timeBlocks || []), nextBlock],
      });
      await fetchTasks();
      await fetchNowPlan(today, currentTime, day);
      toast.success("Habit added to Now schedule");
      setIsAssignOpen(false);
    } catch {
      toast.error("Failed to assign time");
    }
  };

  const handleCompleteCurrent = async () => {
    if (!nowPlan?.current) return;

    try {
      await toggleLog(nowPlan.current.task._id, today);
      await fetchNowPlan(today, currentTime, day);
    } catch {
      toast.error("Failed to update habit");
    }
  };

  const handleToggleScheduled = async (taskId: string) => {
    try {
      await toggleLog(taskId, today);
      await fetchNowPlan(today, currentTime, day);
    } catch {
      toast.error("Failed to update habit");
    }
  };

  const gradient = getTimeGradient(now);
  const progress = getMinuteProgress(now);
  const current = nowPlan?.current;
  const next = nowPlan?.next;
  const schedule = nowPlan?.schedule || [];
  const displayHour = format(now, "h:mm");
  const displayMeridiem = format(now, "a");
  const scheduledMinutes = schedule.reduce(
    (total, item) => total + Math.max(0, item.endMinutes - item.startMinutes),
    0
  );
  const coveragePercent = Math.min(
    100,
    Math.round((scheduledMinutes / 1440) * 100)
  );
  const completionPercent = nowPlan?.stats.scheduled
    ? Math.round(
        ((nowPlan?.stats.completed || 0) / nowPlan.stats.scheduled) * 100
      )
    : 0;
  const currentBlockProgress = current
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((now.getHours() * 60 + now.getMinutes() - current.startMinutes) /
              Math.max(1, current.endMinutes - current.startMinutes)) *
              100
          )
        )
      )
    : 0;
  const commandTone = isCurrentCompleted
    ? "Block cleared"
    : current
    ? "Stay with this"
    : next
    ? "Prepare next"
    : "Design time";

  return (
    <div className="min-h-[calc(100vh-120px)] space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-zinc-950 p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] dark:border-white/10 md:p-6">
        <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[72px_72px] opacity-20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/10 to-transparent" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-white shadow-sm backdrop-blur hover:bg-white/20">
                <Radar className="mr-1 h-3 w-3" />
                Now Engine
              </Badge>
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/55">
                Updates every minute
              </span>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-white/50">
                {format(now, "EEEE, MMMM d")}
              </p>
              <div className="mt-2 flex items-end gap-4">
                <h1 className="text-7xl font-semibold tracking-[-0.08em] md:text-9xl">
                  {displayHour}
                </h1>
                <span className="mb-3 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold tracking-widest text-white/70 backdrop-blur md:mb-5">
                  {displayMeridiem}
                </span>
              </div>
              <div className="mt-6 h-2 max-w-xl overflow-hidden rounded-full bg-white/10 shadow-inner">
                <div
                  className="h-full rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.45)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-white/45">
                {progress}% of today has unfolded.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-2xl md:p-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  What to do now
                </span>
                {current && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {formatDisplayTime(current.block.startTime)} -{" "}
                    {formatDisplayTime(current.block.endTime)}
                  </span>
                )}
              </div>

              {current ? (
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                      {current.task.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                      {current.task.description ||
                        current.block.label ||
                        "Stay inside this time block and execute the assigned habit."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-white text-zinc-950">
                        {getCategoryName(current.task)}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-white/20 text-white">
                        {current.minutesRemaining} min remaining
                      </Badge>
                      {isCurrentCompleted && (
                        <Badge className="rounded-full bg-emerald-500 text-white">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="rounded-full bg-white px-6 text-zinc-950 shadow-lg shadow-black/20 hover:bg-zinc-200"
                    onClick={handleCompleteCurrent}
                  >
                    {isCurrentCompleted ? (
                      <Circle className="mr-2 h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    )}
                    {isCurrentCompleted ? "Mark Undone" : "Complete Now"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                      No habit assigned right now
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                      Assign an existing habit to this time window and the Now
                      engine will start guiding your day.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="rounded-full bg-white px-6 text-zinc-950 shadow-lg shadow-black/20 hover:bg-zinc-200"
                    onClick={() => openAssignDialog()}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Assign Habit
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 self-end">
            <PremiumClock now={now} />
            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-5 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center gap-3 text-white/60">
                <AlarmClock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Up Next
                </span>
              </div>
              {next ? (
                <div className="mt-4">
                  <p className="text-xl font-bold">{next.task.title}</p>
                  <p className="mt-1 text-sm text-white/50">
                    Starts in {next.minutesUntilStart} min at{" "}
                    {formatDisplayTime(next.block.startTime)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/50">
                  No upcoming time block today.
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatTile
                label="Scheduled"
                value={nowPlan?.stats.scheduled || 0}
                icon={CalendarClock}
              />
              <StatTile
                label="Done"
                value={nowPlan?.stats.completed || 0}
                icon={CheckCircle2}
              />
              <StatTile
                label="Open"
                value={nowPlan?.stats.remaining || 0}
                icon={TimerReset}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Command"
          value={commandTone}
          detail={
            current
              ? `${current.minutesRemaining} minutes left in this window`
              : next
              ? `${next.minutesUntilStart} minutes until next block`
              : "No active block is scheduled"
          }
          icon={Gauge}
        />
        <InsightCard
          label="Current Block"
          value={`${currentBlockProgress}%`}
          detail={
            current
              ? `${formatDisplayTime(current.block.startTime)} to ${formatDisplayTime(
                  current.block.endTime
                )}`
              : "Waiting for the next assigned habit"
          }
          icon={TimerReset}
          progress={currentBlockProgress}
        />
        <InsightCard
          label="Completion"
          value={`${completionPercent}%`}
          detail={`${nowPlan?.stats.completed || 0} of ${
            nowPlan?.stats.scheduled || 0
          } scheduled blocks cleared`}
          icon={BarChart3}
          progress={completionPercent}
        />
        <InsightCard
          label="Day Coverage"
          value={`${coveragePercent}%`}
          detail={`${Math.round(scheduledMinutes / 60)}h mapped into your OS`}
          icon={Layers3}
          progress={coveragePercent}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] border border-zinc-200/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.02em]">
                <Clock3 className="h-5 w-5" />
                Today Timeline
              </h2>
              <p className="text-sm text-muted-foreground">
                Time blocks from your actual habits.
              </p>
            </div>
            <Button onClick={() => openAssignDialog()} className="gap-2 rounded-full">
              <Plus className="h-4 w-4" />
              Add Time Block
            </Button>
          </div>

          <div className="space-y-3">
            {schedule.length === 0 ? (
              <EmptyPanel
                title="No scheduled habits today"
                description="Add a time period to an existing habit to populate your Now timeline."
              />
            ) : (
              schedule.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "grid gap-4 rounded-2xl border p-4 transition-all md:grid-cols-[120px_1fr_auto]",
                    item.isCurrent
                      ? "border-zinc-950/20 bg-zinc-950/[0.03] shadow-sm dark:border-white/20 dark:bg-white/[0.06]"
                      : "bg-white/70 dark:bg-white/[0.03]",
                    item.isPast && !item.isCurrent && "opacity-60"
                  )}
                >
                  <div className="text-sm font-semibold">
                    {formatDisplayTime(item.block.startTime)}
                    <div className="mt-1 text-xs font-medium text-muted-foreground">
                      {formatDisplayTime(item.block.endTime)}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.task.title}</h3>
                      {item.isCurrent && <Badge className="rounded-full">Now</Badge>}
                      {item.isCompleted && (
                        <Badge className="rounded-full bg-emerald-500 text-white">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.block.label || item.task.description || getCategoryName(item.task)}
                    </p>
                  </div>
                  <Button
                    variant={item.isCompleted ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleScheduled(item.task._id)}
                    className="gap-2 self-center rounded-full"
                  >
                    {item.isCompleted ? (
                      <Circle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {item.isCompleted ? "Undo" : "Done"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-zinc-200/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.02em]">
              <Layers3 className="h-5 w-5 text-sky-500" />
              Day Architecture
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A quick read on how structured your day is.
            </p>

            <div className="mt-5 space-y-4">
              <MetricBar
                label="Mapped Time"
                value={`${coveragePercent}%`}
                progress={coveragePercent}
              />
              <MetricBar
                label="Completion"
                value={`${completionPercent}%`}
                progress={completionPercent}
              />
              <MetricBar
                label="Loose Habits"
                value={`${unscheduledTasks.length}`}
                progress={
                  assignableTasks.length
                    ? Math.round(
                        ((assignableTasks.length - unscheduledTasks.length) /
                          assignableTasks.length) *
                          100
                      )
                    : 0
                }
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-zinc-200/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.02em]">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Habits Without Time
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Turn loose habits into Now-aware routines.
            </p>

            <div className="mt-5 space-y-3">
              {unscheduledTasks.length === 0 ? (
                <EmptyPanel
                  title="Every active habit has time"
                  description="Your day has a real operating rhythm now."
                />
              ) : (
                unscheduledTasks.slice(0, 6).map((task) => (
                  <button
                    key={task._id}
                    className="w-full rounded-2xl border bg-white/70 p-3 text-left transition-colors hover:border-zinc-950/30 hover:bg-zinc-950/[0.03] dark:bg-white/[0.03] dark:hover:border-white/20"
                    onClick={() => openAssignDialog(task)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getCategoryName(task)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-zinc-900 bg-zinc-950 p-5 text-white shadow-xl dark:border-white/10">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="h-5 w-5" />
              <h3 className="font-bold">Now Rule</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">
              If there is a current block, do that. If there is no current
              block, prepare the next one. If nothing is scheduled, assign time
              to a habit instead of guessing.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="overflow-hidden border-0 bg-background p-0 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:max-w-2xl">
          <div className="relative overflow-hidden bg-zinc-950 px-6 py-6 text-white">
            <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-sky-500/10" />
            <div className="relative z-10">
              <DialogHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  Assign Habit Time
                </DialogTitle>
                <DialogDescription className="text-white/55">
                  Connect an existing habit to a precise Now window.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-widest text-white/45">
                  Preview
                </div>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">
                      {selectedTask?.title || "Choose a habit"}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      {formatDisplayTime(startTime)} - {formatDisplayTime(endTime)}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-white text-zinc-950">
                    {selectedDays.length === 7
                      ? "Every day"
                      : `${selectedDays.length} days/week`}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleAssignTime} className="space-y-5 p-6">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Habit
              </Label>
              <div className="relative">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex h-12 flex-1 items-center justify-between rounded-2xl border bg-muted/40 px-4 text-left text-sm transition-colors hover:bg-muted/60"
                    onClick={() => setIsHabitPickerOpen((open) => !open)}
                    disabled={isDialogHabitsLoading}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {isDialogHabitsLoading
                          ? "Loading habits..."
                          : selectedTask?.title || "Choose habit"}
                      </span>
                      {selectedTask && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {getCategoryName(selectedTask)} ·{" "}
                          {selectedTask.difficulty}
                        </span>
                      )}
                    </span>
                    {isDialogHabitsLoading ? (
                      <Loader2 className="ml-3 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight
                        className={cn(
                          "ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          isHabitPickerOpen && "rotate-90"
                        )}
                      />
                    )}
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl"
                    onClick={() => loadDialogHabits()}
                    disabled={isDialogHabitsLoading}
                    title="Refresh habits"
                  >
                    {isDialogHabitsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isHabitPickerOpen && (
                  <div className="absolute left-0 right-14 top-[calc(100%+8px)] z-[120] overflow-hidden rounded-2xl border bg-popover shadow-2xl">
                    <div className="border-b p-2">
                      <Input
                        autoFocus
                        value={habitQuery}
                        onChange={(event) => setHabitQuery(event.target.value)}
                        placeholder="Search all habits..."
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-2">
                      {isDialogHabitsLoading ? (
                        <div className="flex items-center justify-center gap-2 p-5 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading habits
                        </div>
                      ) : filteredHabitOptions.length > 0 ? (
                        filteredHabitOptions.map((task) => (
                          <button
                            key={task._id}
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent",
                              task._id === effectiveSelectedTaskId &&
                                "bg-accent"
                            )}
                            onClick={() => handleHabitChange(task._id)}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {task.title}
                              </span>
                              <span className="mt-1 block truncate text-xs text-muted-foreground">
                                {getCategoryName(task)} · {task.difficulty}
                                {task.active === false ? " · Inactive" : ""}
                              </span>
                            </span>
                            {task._id === effectiveSelectedTaskId && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-5 text-center text-sm text-muted-foreground">
                          {habitOptions.length === 0
                            ? "No habits returned by the API."
                            : "No habits match your search."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedTask ? (
                <p className="text-xs text-muted-foreground">
                  {getCategoryName(selectedTask)} · {selectedTask.difficulty}
                  {selectedTask.active === false ? " · Inactive" : ""}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  {isDialogHabitsLoading || isLoading
                    ? "Loading your habit library..."
                    : "No habits found yet. Create a habit first, then assign it here."}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Focus Label
              </Label>
              <Input
                className="h-12 rounded-2xl bg-muted/40"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Optional, e.g. Morning deep work"
              />
            </div>

            <div className="grid gap-3 rounded-2xl border bg-muted/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Time Window
                </Label>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDisplayTime(startTime)} to {formatDisplayTime(endTime)}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TimePickerField
                  label="Start"
                  value={startTime}
                  onChange={setStartTime}
                />
                <TimePickerField
                  label="End"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Repeat
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {DAY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleDay(option.value)}
                    className={cn(
                      "rounded-full border px-2 py-2 text-xs font-bold transition-all",
                      selectedDays.includes(option.value)
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-zinc-950"
                        : "bg-background text-muted-foreground hover:border-zinc-400"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t pt-5">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedTask || isLoading}
                className="rounded-full px-6"
              >
                Save Time Block
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <Icon className="mb-3 h-4 w-4 text-white/50" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </div>
    </div>
  );
}

function PremiumClock({ now }: { now: Date }) {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-5 shadow-xl backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/45">
            System Clock
          </div>
          <div className="mt-1 text-sm text-white/65">
            {format(now, "h:mm a")}
          </div>
        </div>
        <Badge className="rounded-full bg-white text-zinc-950">
          {format(now, "a")}
        </Badge>
      </div>

      <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-white/10 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_30px_80px_rgba(0,0,0,0.22)]">
        <div className="relative h-full w-full rounded-full border border-white/10 bg-zinc-950/70 shadow-inner">
          <div className="absolute inset-3 rounded-full border border-white/5" />
          {[...Array(12)].map((_, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 h-2 w-0.5 origin-[50%_calc(50%+92px)] rounded-full bg-white/45"
              style={{
                transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-92px)`,
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 h-16 w-1 origin-bottom rounded-full bg-white"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[5.5rem] w-0.5 origin-bottom rounded-full bg-white/80"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-24 w-px origin-bottom rounded-full bg-sky-300"
            style={{
              transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white shadow-lg" />
          <div className="absolute inset-x-0 bottom-10 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            OL-OS
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  detail,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  progress?: number;
}) {
  return (
    <div className="rounded-[24px] border border-zinc-200/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Icon className="h-5 w-5" />
        </div>
        {typeof progress === "number" && (
          <span className="text-xs font-semibold text-muted-foreground">
            {progress}%
          </span>
        )}
      </div>
      <div className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-zinc-950 transition-all duration-700 dark:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function MetricBar({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-zinc-950 transition-all duration-700 dark:bg-white"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function TimePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const parts = getTimeParts(value);

  const updateTime = (
    nextPart: Partial<{
      hour: string;
      minute: string;
      meridiem: Meridiem;
    }>
  ) => {
    onChange(
      buildTimeValue(
        nextPart.hour ?? parts.hour,
        nextPart.minute ?? parts.minute,
        nextPart.meridiem ?? parts.meridiem
      )
    );
  };

  return (
    <div className="grid gap-2">
      <Label className="text-sm">{label}</Label>
      <div className="grid grid-cols-[1fr_1fr_86px] gap-2">
        <Select
          value={parts.hour}
          onValueChange={(hour) => updateTime({ hour })}
        >
          <SelectTrigger className="h-12 rounded-xl bg-background font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {HOURS_12.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={parts.minute}
          onValueChange={(minute) => updateTime({ minute })}
        >
          <SelectTrigger className="h-12 rounded-xl bg-background font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100] max-h-72">
            {MINUTES.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={parts.meridiem}
          onValueChange={(meridiem) =>
            updateTime({ meridiem: meridiem as Meridiem })
          }
        >
          <SelectTrigger className="h-12 rounded-xl bg-background font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
