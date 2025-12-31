"use client";

import { useContentStore } from "@/stores/contentStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, PlayCircle, CheckCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ContentNav } from "@/components/ContentNav";

export default function WorkstationPage() {
  const { contents, fetchContents, createContent } = useContentStore();
  const router = useRouter();
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const activeYoutube = contents.filter(
    (c) =>
      c.platform === "youtube" &&
      ["scripting", "filming", "editing", "idea"].includes(c.status)
  );

  const handleCreate = async () => {
    const newItem = {
      title: "Untitled Project",
      platform: "youtube",
      type: "video",
      status: "idea",
      tasks: [],
      researchNotes: "",
      researchLinks: [],
    };
    // @ts-expect-error - createContent type definition mismatch, widely used pattern in this project
    await createContent(newItem);
    toast.success("Project Initialized");
  };

  return (
    <div
      className={cn(
        "flex flex-col space-y-8 bg-background transition-all duration-300",
        isFullScreen
          ? "fixed inset-0 z-100 h-screen w-screen p-8 overflow-y-auto"
          : "h-full w-full p-8"
      )}
    >
      {!isFullScreen && <ContentNav />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Workstation
          </h1>
          <p className="text-muted-foreground">
            Manage your active video pipeline.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title="Toggle Full Screen"
          >
            {isFullScreen ? (
              <Maximize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={handleCreate}
            size="lg"
            className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
          >
            <Plus className="w-5 h-5 mr-2" /> New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACTIVE PROJECTS */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <PlayCircle className="w-5 h-5" /> In Progress
          </h2>

          {activeYoutube.length === 0 && (
            <div className="border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
              No active projects. Start something new!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeYoutube.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:border-red-500/50 transition-all group"
                onClick={() =>
                  router.push(
                    `/dashboard/content/youtube/project/${project._id}`
                  )
                }
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="outline"
                      className={cn(
                        "uppercase tracking-wider text-[10px] font-bold",
                        project.status === "idea"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                          : project.status === "scripting"
                          ? "bg-orange-500/10 text-orange-600 border-orange-200"
                          : project.status === "filming"
                          ? "bg-red-500/10 text-red-600 border-red-200"
                          : "bg-purple-500/10 text-purple-600 border-purple-200"
                      )}
                    >
                      {project.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Last edit: Today
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-red-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {project.tasks?.filter((t) => t.isCompleted).length ||
                        0}{" "}
                      tasks done
                    </div>
                  </div>

                  {/* Progress Bar Mockup */}
                  <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: "45%" }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* QUICK STATS / REMINDERS */}
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">System Status</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Scripting Phase</span>
                <span className="font-bold">2 Projects</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Filming Phase</span>
                <span className="font-bold">1 Project</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Editing Phase</span>
                <span className="font-bold">0 Projects</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
