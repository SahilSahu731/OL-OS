"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Activity,
  ListChecks,
  BarChart2,
  Zap,
  Image as ImageIcon,
} from "lucide-react";

export function ContentNav() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-2 border-b mb-6 overflow-x-auto no-scrollbar">
      <Link
        href="/dashboard/content"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname === "/dashboard/content"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Overview
      </Link>
      <Link
        href="/dashboard/content/track"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname.includes("/dashboard/content/track")
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Activity className="h-4 w-4" />
        Track
      </Link>
      <Link
        href="/dashboard/content/manage"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname.includes("/dashboard/content/manage")
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <ListChecks className="h-4 w-4" />
        Manage
      </Link>
      <Link
        href="/dashboard/content/analytics"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname.includes("/dashboard/content/analytics")
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <BarChart2 className="h-4 w-4" />
        Analytics
      </Link>
      <Link
        href="/dashboard/content/focus"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname.includes("/dashboard/content/focus")
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Zap className="h-4 w-4" />
        Focus
      </Link>
      <Link
        href="/dashboard/content/social-image"
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
          pathname.includes("/dashboard/content/social-image")
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <ImageIcon className="h-4 w-4" />
        Social Image
      </Link>
    </div>
  );
}
