"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTaskStore, type NowScheduleItem } from "@/stores/taskStore";

const PROMPTED_KEY = "ol-os-now-notifications-prompted";
const REMINDER_PREFIX = "ol-os-now-reminder";

const formatDisplayTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, "h:mm a");
};

const getReminderKey = (date: string, item: NowScheduleItem) =>
  `${REMINDER_PREFIX}-${date}-${item.id}`;

const getReminderBody = (item: NowScheduleItem) => {
  const title = item.task.title;
  const label = item.block.label ? `${item.block.label}: ` : "";
  return `${label}${title} starts at ${formatDisplayTime(item.block.startTime)}.`;
};

export function NowReminderAgent() {
  const notificationsEnabled = useSettingsStore((state) => state.notifications);
  const fetchNowPlan = useTaskStore((state) => state.fetchNowPlan);
  const nowPlan = useTaskStore((state) => state.nowPlan);
  const lastPromptedRef = useRef(false);

  useEffect(() => {
    if (!notificationsEnabled || typeof window === "undefined") return;

    const syncNowPlan = () => {
      const now = new Date();
      fetchNowPlan(format(now, "yyyy-MM-dd"), format(now, "HH:mm"), now.getDay());
    };

    syncNowPlan();
    const timer = window.setInterval(syncNowPlan, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [fetchNowPlan, notificationsEnabled]);

  useEffect(() => {
    if (
      !notificationsEnabled ||
      !nowPlan ||
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (
      Notification.permission === "default" &&
      !lastPromptedRef.current &&
      window.localStorage.getItem(PROMPTED_KEY) !== "true"
    ) {
      lastPromptedRef.current = true;
      window.localStorage.setItem(PROMPTED_KEY, "true");
      toast("Enable Now reminders?", {
        description: "OL-OS can notify you 5 minutes before each habit block.",
        action: {
          label: "Enable",
          onClick: async () => {
            const permission = await Notification.requestPermission();
            toast(
              permission === "granted"
                ? "Now reminders enabled."
                : "Notification permission was not enabled."
            );
          },
        },
      });
      return;
    }

    if (Notification.permission !== "granted") return;

    const upcomingBlocks = nowPlan.schedule.filter(
      (item) =>
        !item.isCompleted &&
        item.minutesUntilStart > 0 &&
        item.minutesUntilStart <= 5
    );

    upcomingBlocks.forEach((item) => {
      const reminderKey = getReminderKey(nowPlan.date, item);
      if (window.localStorage.getItem(reminderKey) === "true") return;

      window.localStorage.setItem(reminderKey, "true");
      new Notification("Now habit block in 5 minutes", {
        body: getReminderBody(item),
        icon: "/favicon.ico",
        tag: reminderKey,
      });
    });
  }, [notificationsEnabled, nowPlan]);

  return null;
}
