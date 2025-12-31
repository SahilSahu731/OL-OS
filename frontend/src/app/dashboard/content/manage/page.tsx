"use client";

import { useState } from "react";
import { useContentStore } from "@/stores/contentStore";
import { ContentNav } from "@/components/ContentNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  MoreVertical,
  Trash2,
  Calendar,
  ArrowUpDown,
  Filter,
  Download,
  FileText,
  Youtube,
  Twitter,
  Instagram,
  Edit,
  Copy,  
  Database,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  blog: FileText,
  linkedin: FileText,
};

const STATUS_Styles = {
  idea: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  scripting: "bg-orange-500/10 text-orange-600 border-orange-200",
  filming: "bg-red-500/10 text-red-600 border-red-200",
  editing: "bg-purple-500/10 text-purple-600 border-purple-200",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-200",
  published: "bg-green-500/10 text-green-600 border-green-200",
};

export default function ManagePage() {
  const { contents, deleteContent, updateContent } = useContentStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filtered = contents.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus ? c.status === filterStatus : true;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    await deleteContent(id);
    toast.success("Content deleted");
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selected.length} items?`)) {
      selected.forEach((id) => deleteContent(id));
      setSelected([]);
      toast.success("Bulk delete complete");
    }
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="min-h-full space-y-8 pb-20 animate-in fade-in duration-700">
      <ContentNav />

      {/* HEADER WITH STATS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full md:col-span-2 lg:col-span-2 space-y-2"
        >
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <Database className="w-4 h-4" /> Data Grid
          </div>
          <h1 className="text-4xl font-black tracking-tighter">
            Content Database
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            Advanced management for your entire content library. Filter, sort,
            and execute bulk actions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Layers className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
              {contents.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
              Total Items
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {contents.filter((c) => c.status === "published").length}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              Published
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden"
      >
        {/* TOOLBAR */}
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by title..."
                className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "border-dashed",
                    filterStatus && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("idea")}>
                  Idea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("published")}>
                  Published
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-muted-foreground mr-2">
                    {selected.length} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="shadow-lg shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="h-6 w-px bg-border/50 mx-2 hidden md:block" />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selected.length === filtered.length && filtered.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) setSelected(filtered.map((c) => c._id!));
                      else setSelected([]);
                    }}
                  />
                </TableHead>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, index) => {
                  const Icon =
                    PLATFORM_ICONS[
                      (item.platform || "idea") as keyof typeof PLATFORM_ICONS
                    ] || FileText;

                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
                        selected.includes(item._id!) && "bg-muted/60"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item._id!)}
                          onCheckedChange={() => toggleSelect(item._id!)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item._id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="capitalize text-sm font-medium text-muted-foreground">
                            {item.platform}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize font-bold tracking-wider rounded-md px-2.5 py-0.5 border shadow-none",
                            STATUS_Styles[
                              item.status as keyof typeof STATUS_Styles
                            ] || "bg-secondary text-secondary-foreground"
                          )}
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {item.scheduledDate ? (
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground/50" />
                            {format(
                              new Date(item.scheduledDate),
                              "MMM d, yyyy"
                            )}
                          </span>
                        ) : (
                          <span className="opacity-30 text-xs uppercase tracking-widest pl-5">
                            Unscheduled
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toast.info("Edit feature")}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateContent(item._id!, {
                                  status: "published",
                                })
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark
                              Published
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                              onClick={() => handleDelete(item._id!)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
