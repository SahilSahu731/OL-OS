"use client";

import { useState, useEffect } from "react";
import { useContentStore, ContentItem } from "@/stores/contentStore";
import {
  Kanban,
  Maximize2,
  Minimize2,
  Plus,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Instagram,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  LayoutGrid,
  List,
  Search,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger as UiTabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentNav } from "@/components/ContentNav";

// --- HELPERS ---

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    idea: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/30",
    scripting:
      "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30",
    filming: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30",
    editing:
      "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/30",
    scheduled:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30",
    published:
      "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium border capitalize",
        styles[status] || styles["idea"]
      )}
    >
      {status}
    </Badge>
  );
};

const ReelCard = ({
  item,
  onUpdateStatus,
  onEdit,
}: {
  item: ContentItem;
  onUpdateStatus: (id: string, status: string) => void;
  onEdit: (item: ContentItem) => void;
}) => (
  <div className="group relative aspect-9/16 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-border/50 hover:border-pink-500 transition-colors cursor-pointer shadow-sm">
    <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-colors" />

    <div className="absolute inset-0 p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start z-10">
        <StatusBadge status={item.status} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              ✏️ Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateStatus(item._id!, "idea")}>
              📝 Idea
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(item._id!, "scripting")}
            >
              ✍️ Scripting
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(item._id!, "filming")}
            >
              🎥 Filming
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(item._id!, "editing")}
            >
              🎬 Editing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(item._id!, "scheduled")}
            >
              📅 Scheduled
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(item._id!, "published")}
              className="text-green-600"
            >
              ✅ Published
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div onClick={() => onEdit(item)}>
        <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-pink-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-[10px] text-muted-foreground line-clamp-1">
          {item.scheduledDate
            ? `📅 ${new Date(item.scheduledDate).toLocaleDateString()}`
            : item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : "Recently"}
        </p>
      </div>
    </div>
  </div>
);

const PostRow = ({
  item,
  onUpdateStatus,
  onEdit,
}: {
  item: ContentItem;
  onUpdateStatus: (id: string, status: string) => void;
  onEdit: (item: ContentItem) => void;
}) => (
  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
      {item.type === "reel" ? (
        <Film className="w-5 h-5" />
      ) : (
        <ImageIcon className="w-5 h-5" />
      )}
    </div>
    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-semibold text-sm truncate group-hover:text-pink-600 transition-colors">
          {item.title}
        </h4>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Type: <span className="capitalize">{item.type || "Post"}</span>
        </span>
        {item.scheduledDate && (
          <span className="text-blue-500 font-medium">
            📅 {new Date(item.scheduledDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {item.status !== "published" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20"
          onClick={() => onUpdateStatus(item._id!, "published")}
          title="Quick Complete"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" /> Finish
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onUpdateStatus(item._id!, "scripting")}
          >
            Move to Scripting
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onUpdateStatus(item._id!, "scheduled")}
          >
            Move to Scheduled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

const CalendarView = ({
  items,
  onEdit,
}: {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Create matrix
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-pink-500" />
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(year, month - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(year, month + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-muted/50 p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {totalSlots.map((day, i) => {
          if (!day) return <div key={i} className="bg-card min-h-[120px]" />;

          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          // Filter items for this day (checking scheduledDate or fallback to nothing)
          const dayItems = items.filter((item) => {
            if (!item.scheduledDate) return false;
            return item.scheduledDate.startsWith(dateStr);
          });

          return (
            <div
              key={i}
              className="bg-card min-h-[120px] p-2 hover:bg-muted/20 transition-colors border-t relative group"
            >
              <span
                className={cn(
                  "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full mb-1",
                  day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                    ? "bg-pink-600 text-white"
                    : "text-muted-foreground"
                )}
              >
                {day}
              </span>

              <div className="space-y-1">
                {dayItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    className={cn(
                      "text-[10px] p-1.5 rounded cursor-pointer truncate flex items-center gap-1 border border-l-2 hover:opacity-80 transition-opacity shadow-sm",
                      item.status === "published"
                        ? "bg-green-50 border-l-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : item.status === "scheduled"
                        ? "bg-blue-50 border-l-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "bg-gray-50 border-l-gray-400 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                    )}
                  >
                    {item.type === "reel" ? (
                      <Film className="w-3 h-3 shrink-0" />
                    ) : (
                      <ImageIcon className="w-3 h-3 shrink-0" />
                    )}
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EditDialog = ({
  item,
  open,
  onOpenChange,
  onSave,
}: {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<ContentItem>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<ContentItem>>(() => {
    if (!item) return {};
    return {
      title: item.title,
      status: item.status,
      type: item.type,
      description: item.description || "",
      scheduledDate: item.scheduledDate ? item.scheduledDate.split("T")[0] : "",
    };
  });

  const handleSave = () => {
    if (item?._id) {
      onSave(item._id, formData);
      onOpenChange(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update details for this scheduled post.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(v: string) =>
                setFormData({ ...formData, status: v as ContentItem["status"] })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="scripting">Scripting</SelectItem>
                <SelectItem value="filming">Filming</SelectItem>
                <SelectItem value="editing">Editing</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Schedule
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.scheduledDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="desc" className="text-right pt-2">
              Caption
            </Label>
            <Textarea
              id="desc"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3 h-24"
              placeholder="#hashtags and caption..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function InstagramPage() {
  const { contents, fetchContents, createContent, updateContent } =
    useContentStore();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await updateContent(id, { status: newStatus as ContentItem["status"] });
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleSaveEdit = async (id: string, data: Partial<ContentItem>) => {
    await updateContent(id, data);
    toast.success("Content updated successfully");
    setEditingItem(null);
  };

  const igContents = contents.filter((c) => c.platform === "instagram");

  // Filter by tab + search
  const filteredContents = igContents.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "calendar") return matchesSearch; // Calendar handles its own view, but we pass filtered list if needed or all
    if (activeTab === "pipeline")
      return (
        matchesSearch &&
        !["published", "archived", "scheduled"].includes(c.status)
      );
    if (activeTab === "scheduled")
      return matchesSearch && c.status === "scheduled";
    if (activeTab === "published")
      return matchesSearch && c.status === "published";
    return matchesSearch;
  });

  const reels = filteredContents.filter((c) => c.type === "reel" || !c.type);
  const posts = filteredContents.filter((c) => c.type === "post");

  // Dynamic stats
  const stats = {
    total: igContents.length,
    pipeline: igContents.filter(
      (c) => !["published", "archived"].includes(c.status)
    ).length,
    scheduled: igContents.filter((c) => c.status === "scheduled").length,
    published: igContents.filter((c) => c.status === "published").length,
  };

  const handleCreate = async (type: "reel" | "post" = "reel") => {
    const newItem = {
      title: "Untitled " + (type === "reel" ? "Reel" : "Post"),
      platform: "instagram" as const,
      type,
      status: "idea" as const,
      description: "",
      tasks: [],
    };
    await createContent(newItem);
    toast.success(`New ${type} created`);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isFullScreen
          ? "fixed inset-0 z-100 h-screen w-screen"
          : "h-full w-full relative min-h-[calc(100vh-4rem)]"
      )}
    >
      {!isFullScreen && (
        <div className="px-8 pt-6">
          <ContentNav />
        </div>
      )}
      {/* HEADER */}
      <div className="px-8 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-linear-to-tr from-yellow-400 via-orange-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Instagram Studio
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] font-normal"
              >
                {stats.total} Total
              </Badge>
              <span className="opacity-50">•</span>
              <span className="font-medium text-foreground">
                {stats.pipeline} Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-9 h-9 bg-muted/50 border-muted focus-visible:ring-1 focus-visible:ring-pink-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="hover:bg-muted"
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullScreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={() => handleCreate("reel")}
            className="bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-pink-600/20 border-0"
          >
            <Plus className="w-4 h-4 mr-2" /> New Reel
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-row">
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-64 border-r bg-muted/5 hidden lg:flex flex-col p-4 gap-6 shrink-0">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 mt-2">
              Views
            </h3>
            <Button
              variant={activeTab === "pipeline" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm",
                activeTab === "pipeline" &&
                  "bg-pink-50 text-pink-700 dark:bg-pink-900/10 dark:text-pink-300"
              )}
              onClick={() => setActiveTab("pipeline")}
            >
              <Kanban className="w-4 h-4 mr-2" /> Pipeline
              <Badge className="ml-auto bg-primary/10 text-primary border-0">
                {stats.pipeline}
              </Badge>
            </Button>
            <Button
              variant={activeTab === "scheduled" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm",
                activeTab === "scheduled" &&
                  "bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-300"
              )}
              onClick={() => setActiveTab("scheduled")}
            >
              <Clock className="w-4 h-4 mr-2" /> Scheduled
              {stats.scheduled > 0 && (
                <Badge className="ml-auto bg-blue-500/10 text-blue-500 border-0">
                  {stats.scheduled}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "published" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm",
                activeTab === "published" &&
                  "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-300"
              )}
              onClick={() => setActiveTab("published")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Published
              {stats.published > 0 && (
                <Badge className="ml-auto bg-green-500/10 text-green-500 border-0">
                  {stats.published}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "calendar" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm",
                activeTab === "calendar" &&
                  "bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-300"
              )}
              onClick={() => setActiveTab("calendar")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
            </Button>
          </div>

          <div className="mt-auto">
            <Card
              className={cn(
                "border-0 shadow-lg text-white",
                "bg-linear-to-br from-indigo-600 to-purple-700"
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="text-xs font-medium opacity-80">
                  Monthly Goal
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">
                    {stats.published} / 20
                  </div>
                  <div className="text-xs mb-1 opacity-80">Reels</div>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500"
                    style={{
                      width: `${Math.min((stats.published / 20) * 100, 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "calendar" ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <CalendarView items={igContents} onEdit={setEditingItem} />
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* TOOLBAR */}
                <div className="flex items-center justify-between">
                  <Tabs
                    value={viewMode}
                    onValueChange={(v: string) =>
                      setViewMode(v as "board" | "list")
                    }
                    className="w-[180px]"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <UiTabsTrigger value="board" className="text-xs">
                        <LayoutGrid className="w-3.5 h-3.5 mr-2" /> Board
                      </UiTabsTrigger>
                      <UiTabsTrigger value="list" className="text-xs">
                        <List className="w-3.5 h-3.5 mr-2" /> List
                      </UiTabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>
                      {
                        filteredContents.filter(
                          (c) => c.status === "idea" || c.status === "scripting"
                        ).length
                      }{" "}
                      Brainstorming
                    </span>
                    <span>•</span>
                    <span>
                      {
                        filteredContents.filter(
                          (c) =>
                            c.status === "filming" || c.status === "editing"
                        ).length
                      }{" "}
                      In Production
                    </span>
                  </div>
                </div>

                <div className="min-h-[600px]">
                  {viewMode === "board" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <div
                        className="aspect-9/16 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => handleCreate("reel")}
                      >
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mx-auto text-pink-600 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                          </div>
                          <p className="font-medium">Create New</p>
                        </div>
                      </div>

                      {reels.map((item, i) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <ReelCard
                            item={item}
                            onUpdateStatus={handleStatusUpdate}
                            onEdit={setEditingItem}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreate("post")}
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" /> Add Row
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {posts.length > 0 ? (
                          posts.map((item, i) => (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <PostRow
                                item={item}
                                onUpdateStatus={handleStatusUpdate}
                                onEdit={setEditingItem}
                              />
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed text-sm">
                            No feed posts in this view.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <EditDialog
        key={editingItem?._id || "edit-dialog"}
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
