"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface WidgetFrameProps {
  title: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}

export function WidgetFrame({
  title,
  icon: Icon,
  action,
  children,
}: WidgetFrameProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3" />
          <span>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
