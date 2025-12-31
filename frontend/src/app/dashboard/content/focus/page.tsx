"use client";

import { useState } from "react";
import { ContentNav } from "@/components/ContentNav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Save, Clock, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FocusPage() {
  const [text, setText] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordCount = words;
  const readTime = Math.ceil(words / 200);

  const toggleZen = () => {
    setIsZenMode(!isZenMode);
  };

  const handleSave = () => {
    // In a real app, save to a draft in DB
    toast.success("Draft saved successfully");
  };

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out flex flex-col h-full",
        isZenMode ? "fixed inset-0 z-100 bg-background p-8" : "space-y-6"
      )}
    >
      {!isZenMode && <ContentNav />}

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative">
        {/* TOOLBAR */}
        <div className="flex items-center justify-between mb-4 p-2 bg-muted/30 rounded-lg border border-border/40 backdrop-blur">
          <div className="flex items-center gap-1 text-muted-foreground">
            <div className="px-3 py-1 flex items-center gap-2 border-r border-border/40">
              <span className="font-mono font-bold text-foreground">
                {wordCount}
              </span>{" "}
              <span className="text-xs">words</span>
            </div>
            <div className="px-3 py-1 flex items-center gap-2">
              <Clock className="w-3 h-3" />{" "}
              <span className="text-xs">{readTime} min read</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.info("Typography settings coming soon")}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleZen}>
              {isZenMode ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="flex-1 relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-full min-h-[500px] resize-none border-none focus-visible:ring-0 p-8 text-lg md:text-xl leading-relaxed bg-card shadow-sm rounded-xl font-serif"
          />

          {text.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/20 text-4xl font-bold font-serif select-none pointer-events-none">
              Focus & Write
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
