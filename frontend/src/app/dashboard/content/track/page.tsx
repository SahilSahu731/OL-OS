"use client";

import { useContentStore } from "@/stores/contentStore";
import { ContentNav } from "@/components/ContentNav";
import {
  Youtube,
  Twitter,
  Instagram,
  FileText,
  Calendar as CalendarIcon,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Layout,
  Radio,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { format } from "date-fns";

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  blog: FileText,
  linkedin: FileText,
};

// Enhanced gradients for a premium feel
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function TrackPage() {
  const { contents } = useContentStore();

  const inProgress = contents.filter((c) =>
    ["scripting", "filming", "editing"].includes(c.status)
  );
  const scheduled = contents.filter((c) => c.status === "scheduled");
  const ideas = contents.filter((c) => c.status === "idea");
  const published = contents.filter((c) => c.status === "published");

  return (
    <div className="min-h-full pb-20 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 space-y-8">
        <ContentNav />

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end border-b border-border/40 pb-6 px-1"
        >
          <div>
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
              Mission Control
            </h1>
            <p className="text-muted-foreground text-xl mt-2 max-w-2xl font-light">
              Overview of your creative supply chain.
            </p>
          </div>
          <div className="flex gap-8 items-center bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="text-right">
              <div className="text-4xl font-bold font-mono tracking-tight text-foreground">
                {inProgress.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Active
              </div>
            </div>
            <div className="w-px bg-border/60 h-10" />
            <div className="text-right">
              <div className="text-4xl font-bold font-mono tracking-tight text-foreground">
                {scheduled.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Scheduled
              </div>
            </div>
          </div>
        </motion.div>

        {/* ACTIVE PRODUCTION ROW */}
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-1"
          >
            <div className="p-1.5 bg-amber-500/10 rounded-md">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              In Production
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {inProgress.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 border border-dashed border-border/60 rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-card/30 backdrop-blur-sm"
              >
                <div className="p-4 bg-muted/50 rounded-full mb-4 ring-1 ring-border">
                  <Layout className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium text-lg">All caught up.</p>
                <p className="text-sm opacity-60">
                  Example: No content currently in active production.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {inProgress.map((item) => {
                  const Icon =
                    PLATFORM_ICONS[
                      (item.platform || "idea") as keyof typeof PLATFORM_ICONS
                    ] || FileText;
                  const theme =
                    PLATFORM_THEMES[
                      (item.platform || "blog") as keyof typeof PLATFORM_THEMES
                    ];

                  return (
                    <motion.div
                      key={item._id}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card
                        className={cn(
                          "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-500",
                          theme.shadow
                        )}
                      >
                        {/* Gradient Background */}
                        <div
                          className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br",
                            theme.gradient
                          )}
                        />

                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                          <Icon className="w-32 h-32" />
                        </div>

                        <CardHeader className="relative z-10 pb-2">
                          <div className="flex justify-between items-start mb-4">
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
                          <CardTitle className="text-2xl font-bold leading-tight line-clamp-2 min-h-16 flex items-center pr-8">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-6 pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                              <span>Completing...</span>
                              <span className={theme.color}>
                                {item.status === "scripting"
                                  ? "33%"
                                  : item.status === "filming"
                                  ? "66%"
                                  : "90%"}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden p-px">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width:
                                    item.status === "scripting"
                                      ? "33%"
                                      : item.status === "filming"
                                      ? "66%"
                                      : "90%",
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={cn(
                                  "h-full rounded-full opacity-80",
                                  theme.bg.replace("/10", "")
                                )} // active color
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full justify-between group/btn hover:bg-background/80 hover:text-foreground border-border/50"
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover/btn:text-foreground transition-colors">
                              Open Studio
                            </span>
                            <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* UPCOMING SCHEDULE */}
          <section className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-1"
            >
              <div className="p-1.5 bg-sky-500/10 rounded-md">
                <CalendarIcon className="w-4 h-4 text-sky-500" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Run of Show
              </h2>
            </motion.div>

            <Card className="min-h-[500px] border-border/50 shadow-sm bg-card/40 backdrop-blur-sm relative overflow-hidden">
              {/* Aesthetic grid background for the card */}
              <div className="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(0deg,transparent,black)] pointer-events-none" />

              <ScrollArea className="h-full max-h-[600px] p-1 relative z-10">
                <div className="p-4 space-y-3">
                  {scheduled.length === 0 && (
                    <div className="text-center py-20">
                      <div className="inline-flex p-4 rounded-full bg-muted/30 mb-4">
                        <Clock className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        No scheduled content.
                      </p>
                      <p className="text-sm text-muted-foreground/50">
                        Your timeline is clear.
                      </p>
                    </div>
                  )}
                  {scheduled.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-muted/50 text-foreground font-mono border border-border/50 group-hover:border-primary/20 transition-colors">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Dec
                        </span>
                        <span className="text-xl font-bold">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).getDate()
                            : "12"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                              PLATFORM_THEMES[
                                (item.platform ||
                                  "blog") as keyof typeof PLATFORM_THEMES
                              ].color
                            )}
                          />
                          <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {item.scheduledDate
                              ? format(new Date(item.scheduledDate), "p")
                              : "10:00 AM"}
                          </span>
                          <span className="capitalize opacity-75">
                            {item.platform}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                      >
                        Edit
                      </Button>
                    </motion.div>
                  ))}

                  {/* PUBLISHED HISTORY (Faded) */}
                  {published.length > 0 && (
                    <div className="pt-8">
                      <div className="flex items-center gap-4 mb-4 opacity-50">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                          Log History
                        </span>
                        <div className="h-px bg-border flex-1" />
                      </div>
                      {published.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-3 rounded-xl opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                        >
                          <div className="p-1 rounded-full bg-green-500/20 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-medium line-through text-muted-foreground">
                            {item.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5"
                          >
                            {item.platform}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </section>

          {/* IDEAS & QUICK ACTIONS */}
          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-1"
            >
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Rapid Fire
              </h2>
            </motion.div>

            <Card className="h-[600px] border-border/50 flex flex-col bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/20 backdrop-blur-md">
                <Button className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                  <Sparkles className="w-4 h-4 mr-2" /> Capture New Idea
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4 bg-muted/5">
                <div className="space-y-3">
                  {ideas.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold bg-muted/50"
                        >
                          {item.platform}
                        </Badge>
                        <Radio className="w-3 h-3 text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all" />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-foreground/90">
                        {item.title}
                      </p>
                    </motion.div>
                  ))}
                  {ideas.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-20 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                      <p>Brain empty?</p>
                      <Button variant="link" className="text-xs">
                        Start storming &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
