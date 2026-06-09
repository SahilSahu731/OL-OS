"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gauge,
  Radar,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";

interface NowPulseProps {
  variant?: "dashboard" | "today" | "dock";
  className?: string;
}

const formatDisplayTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return format(date, "h:mm a");
};

const getMinuteProgress = (date: Date) =>
  Math.round(((date.getHours() * 60 + date.getMinutes()) / 1440) * 100);

export function NowPulse({ variant = "dashboard", className }: NowPulseProps) {
  const router = useRouter();
  const { logs, nowPlan, fetchLogs, fetchNowPlan, toggleLog } = useTaskStore();
  const [now, setNow] = useState(new Date());

  const today = format(now, "yyyy-MM-dd");
  const currentTime = format(now, "HH:mm");
  const day = now.getDay();
  const current = nowPlan?.current;
  const next = nowPlan?.next;
  const currentKey = current ? `${current.task._id}-${today}` : "";
  const isCurrentCompleted = currentKey ? !!logs[currentKey] : false;
  const progress = getMinuteProgress(now);

  useEffect(() => {
    fetchLogs(today, today);
    fetchNowPlan(today, currentTime, day);
  }, [today, currentTime, day, fetchLogs, fetchNowPlan]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const completionPercent = useMemo(() => {
    if (!nowPlan?.stats.scheduled) return 0;
    return Math.round((nowPlan.stats.completed / nowPlan.stats.scheduled) * 100);
  }, [nowPlan]);

  const command = isCurrentCompleted
    ? "Current block cleared"
    : current
    ? "Do this now"
    : next
    ? "Prepare the next block"
    : "Design your next block";

  const handleComplete = async () => {
    if (!current) {
      router.push("/dashboard/now");
      return;
    }

    await toggleLog(current.task._id, today);
    await fetchNowPlan(today, currentTime, day);
  };

  if (variant === "dock") {
    return (
      <div className={cn("rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white", className)}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Now Pulse
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
              {format(now, "h:mm a")}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Radar className="h-4 w-4 text-cyan-300" />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.08] p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            {command}
          </div>
          <div className="mt-2 text-sm font-semibold">
            {current?.task.title || next?.task.title || "No block scheduled"}
          </div>
          <div className="mt-1 text-xs text-white/45">
            {current
              ? `${formatDisplayTime(current.block.startTime)} - ${formatDisplayTime(current.block.endTime)}`
              : next
              ? `Next at ${formatDisplayTime(next.block.startTime)}`
              : "Open Now to assign a habit."}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniMetric label="Done" value={nowPlan?.stats.completed || 0} />
          <MiniMetric label="Open" value={nowPlan?.stats.remaining || 0} />
          <MiniMetric label="Sync" value={`${completionPercent}%`} />
        </div>

        <Button
          className="mt-4 w-full rounded-full bg-white text-zinc-950 hover:bg-zinc-200"
          size="sm"
          onClick={() => router.push("/dashboard/now")}
        >
          Open Now
        </Button>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border bg-zinc-950 p-5 text-white shadow-2xl",
        variant === "today" && "rounded-[24px]",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-cyan-500/10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px] opacity-20" />

      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-white text-zinc-950">
              <Sparkles className="mr-1 h-3 w-3" />
              Now Intelligence
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              {format(now, "EEEE")}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.3em] text-white/45">
                {command}
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                {current?.task.title || next?.task.title || "Nothing assigned"}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/70">
              {format(now, "h:mm a")}
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            {current
              ? `${current.minutesRemaining} minutes remain in this block.`
              : next
              ? `Next block starts at ${formatDisplayTime(next.block.startTime)}.`
              : "No active block is scheduled. Assign a habit to turn the moment into a plan."}
          </p>

          <div className="mt-5 h-2 max-w-xl overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid min-w-[260px] gap-3">
          <div className="grid grid-cols-3 gap-2">
            <PremiumMetric icon={Clock3} label="Blocks" value={nowPlan?.stats.scheduled || 0} />
            <PremiumMetric icon={CheckCircle2} label="Done" value={nowPlan?.stats.completed || 0} />
            <PremiumMetric icon={Gauge} label="Sync" value={`${completionPercent}%`} />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-full bg-white text-zinc-950 hover:bg-zinc-200"
              onClick={handleComplete}
            >
              {current ? (isCurrentCompleted ? "Undo Block" : "Complete Block") : "Plan Now"}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => router.push("/dashboard/now")}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/[0.08] p-2">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">
        {label}
      </div>
    </div>
  );
}

function PremiumMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <Icon className="mb-3 h-4 w-4 text-white/45" />
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">
        {label}
      </div>
    </div>
  );
}
