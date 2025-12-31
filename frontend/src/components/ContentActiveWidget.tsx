"use client";

import { ContentItem } from "@/stores/contentStore";
import {
  Youtube,
  Twitter,
  Instagram,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  blog: FileText,
  linkedin: FileText,
};

const PLATFORM_THEMES = {
  youtube: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-600/20 via-orange-500/10 to-transparent",
    shadow: "hover:shadow-red-500/10",
  },
  instagram: {
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    gradient: "from-pink-600/20 via-purple-500/10 to-transparent",
    shadow: "hover:shadow-pink-500/10",
  },
  twitter: {
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    gradient: "from-sky-600/20 via-blue-500/10 to-transparent",
    shadow: "hover:shadow-sky-500/10",
  },
  blog: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-600/20 via-teal-500/10 to-transparent",
    shadow: "hover:shadow-emerald-500/10",
  },
  linkedin: {
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
    gradient: "from-blue-700/20 via-indigo-500/10 to-transparent",
    shadow: "hover:shadow-blue-500/10",
  },
};

interface ContentActiveWidgetProps {
  item: ContentItem;
  compact?: boolean;
}

export function ContentActiveWidget({
  item,
  compact = false,
}: ContentActiveWidgetProps) {
  const Icon =
    PLATFORM_ICONS[(item.platform || "blog") as keyof typeof PLATFORM_ICONS] ||
    FileText;
  const theme =
    PLATFORM_THEMES[(item.platform || "blog") as keyof typeof PLATFORM_THEMES];

  const progress =
    item.status === "scripting" ? 33 : item.status === "filming" ? 66 : 90;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-500",
        theme.shadow,
        compact ? "p-0" : ""
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br",
          theme.gradient
        )}
      />

      {/* Decorative Icon Background */}
      <div
        className={cn(
          "absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
          compact ? "p-2" : "p-4"
        )}
      >
        <Icon className={cn(compact ? "w-16 h-16" : "w-32 h-32")} />
      </div>

      <CardHeader
        className={cn("relative z-10 pb-2", compact ? "p-4 pb-2" : "")}
      >
        <div className="flex justify-between items-start mb-2">
          <Badge
            className={cn(
              "uppercase text-[10px] font-bold tracking-widest border-0 py-1 px-2.5",
              theme.bg,
              theme.color
            )}
          >
            {item.platform}
          </Badge>
          <Badge
            variant="outline"
            className="bg-background/40 backdrop-blur border-white/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
            {item.status}
          </Badge>
        </div>
        <CardTitle
          className={cn(
            "font-bold leading-tight line-clamp-2 pr-8",
            compact ? "text-sm min-h-0" : "text-2xl min-h-16 flex items-center"
          )}
        >
          {item.title}
        </CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          "relative z-10 space-y-4 pt-2",
          compact ? "p-4 pt-2" : ""
        )}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Completing...</span>
            <span className={theme.color}>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden p-px">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={cn(
                "h-full rounded-full opacity-80",
                theme.bg.replace("/10", "")
              )}
            />
          </div>
        </div>

        {!compact && (
          <Button
            variant="outline"
            className="w-full justify-between group/btn hover:bg-background/80 hover:text-foreground border-border/50"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover/btn:text-foreground transition-colors">
              Open Studio
            </span>
            <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
