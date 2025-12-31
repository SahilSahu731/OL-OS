"use client";

import { useContentStore } from "@/stores/contentStore";
import { ContentNav } from "@/components/ContentNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  Activity,
  Layers,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, isAfter, startOfDay, parseISO } from "date-fns";

// --- COLOR CONSTANTS ---
const PLATFORM_COLORS = {
  youtube: "#FF0000",
  instagram: "#E1306C",
  twitter: "#1DA1F2",
  blog: "#10B981",
  linkedin: "#0A66C2",
};

export default function AnalyticsPage() {
  const { contents } = useContentStore();
  const [timeRange, setTimeRange] = useState("30d");
  const [filterPlatform, setFilterPlatform] = useState("all");

  // --- REAL DATA CALCULATION ---

  // 1. Filtered Content based on Platform and Time Range
  const filteredContents = useMemo(() => {
    const now = new Date();
    const daysToSubtract =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 365;
    const startDate = startOfDay(subDays(now, daysToSubtract));

    return contents.filter((c) => {
      const matchPlatform =
        filterPlatform === "all" || c.platform === filterPlatform;
      const cDate = c.createdAt ? parseISO(c.createdAt) : new Date(); // fallback to now if missing
      const matchDate = isAfter(cDate, startDate);
      return matchPlatform && matchDate;
    });
  }, [contents, timeRange, filterPlatform]);

  // 2. Aggregate Metrics (Views, Likes, Engagement)
  const aggregates = useMemo(() => {
    let views = 0;
    let likes = 0;
    let comments = 0;
    let shares = 0;

    filteredContents.forEach((c) => {
      views += c.metrics?.views || 0;
      likes += c.metrics?.likes || 0;
      comments += c.metrics?.comments || 0;
      // approximating shares/engagement if not explicitly tracked
      shares += Math.floor((c.metrics?.likes || 0) * 0.1);
    });

    const totalEngagement = likes + comments + shares;
    const engagementRate =
      views > 0 ? ((totalEngagement / views) * 100).toFixed(2) : "0.00";

    return { views, likes, comments, shares, totalEngagement, engagementRate };
  }, [filteredContents]);

  // 3. Chart Data: Content Volume Over Time (Real)
  const volumeChartData = useMemo(() => {
    // Map entries to days
    const dailyMap = new Map<
      string,
      { date: string; count: number; views: number }
    >();

    // Initialize empty days to ensure continuous axis
    const daysToSubtract =
      timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    for (let i = daysToSubtract; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      dailyMap.set(key, { date: format(d, "MMM dd"), count: 0, views: 0 });
    }

    filteredContents.forEach((c) => {
      const d = c.createdAt ? parseISO(c.createdAt) : new Date();
      const key = format(d, "yyyy-MM-dd");
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key)!;
        entry.count += 1;
        entry.views += c.metrics?.views || 0;
        dailyMap.set(key, entry);
      }
    });

    return Array.from(dailyMap.values());
  }, [filteredContents, timeRange]);

  // 4. Chart Data: Platform Distribution (Pie)
  const platformDistData = useMemo(() => {
    const map = new Map<string, number>();
    filteredContents.forEach((c) => {
      const p = c.platform || "other";
      map.set(p, (map.get(p) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        fill: PLATFORM_COLORS[name as keyof typeof PLATFORM_COLORS] || "#888",
      }))
      .filter((x) => x.value > 0);
  }, [filteredContents]);

  // 5. Chart Data: Views by Platform (Bar)
  const viewsByPlatformData = useMemo(() => {
    const map = new Map<string, number>();
    filteredContents.forEach((c) => {
      const p = c.platform || "other";
      map.set(p, (map.get(p) || 0) + (c.metrics?.views || 0));
    });

    return Array.from(map.entries())
      .map(([name, views]) => ({
        name,
        views,
        fill: PLATFORM_COLORS[name as keyof typeof PLATFORM_COLORS] || "#888",
      }))
      .filter((x) => x.views > 0);
  }, [filteredContents]);

  // 6. Content Leaderboard (Real sorting)
  const topContent = useMemo(() => {
    return [...filteredContents]
      .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
      .slice(0, 5);
  }, [filteredContents]);

  return (
    <div className="min-h-full pb-20 space-y-8 animate-in fade-in duration-700 relative">
      <ContentNav />

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            Analytics Command
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              LIVE DATA
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Analyzing {filteredContents.length} items from your database.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ecosystem</SelectItem>
              <SelectItem value="youtube">YouTube Studio</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">X / Twitter</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-muted p-1 rounded-lg self-start">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                  timeRange === range
                    ? "bg-background shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI CARDS (REAL AGGREGATES) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Views",
            value: aggregates.views.toLocaleString(),
            sub: "Lifetime Views",
            icon: Eye,
            color: "text-indigo-500",
            bg: "from-indigo-500/10",
          },
          {
            label: "Total Engagement",
            value: aggregates.totalEngagement.toLocaleString(),
            sub: "Likes + Comments",
            icon: Activity,
            color: "text-pink-500",
            bg: "from-pink-500/10",
          },
          {
            label: "Engagement Rate",
            value: `${aggregates.engagementRate}%`,
            sub: "Avg per view",
            icon: MousePointerClick,
            color: "text-cyan-500",
            bg: "from-cyan-500/10",
          },
          {
            label: "Content Volume",
            value: filteredContents.length,
            sub: "Items in period",
            icon: Layers,
            color: "text-emerald-500",
            bg: "from-emerald-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={cn(
                "border-border/50 relative overflow-hidden bg-linear-to-br to-transparent",
                stat.bg
              )}
            >
              {/* Decorative bg icon */}
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <stat.icon className="w-24 h-24" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                  {stat.label}
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">
                  {stat.sub}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CHART GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* VOLUME CHART */}
        <Card className="col-span-2 border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Production Velocity</CardTitle>
                <CardDescription>
                  Items created over result period ({timeRange}).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={volumeChartData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.05}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="#555"
                    minTickGap={30}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="#555"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.9)",
                      borderColor: "#333",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Items Created"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#colorCount)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PLATFORM DISTRIBUTION */}
        <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Platform Mix</CardTitle>
            <CardDescription>Content count distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="rgba(0,0,0,0.2)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold">
                  {filteredContents.length}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Items
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {platformDistData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.fill }}
                    />
                    <span className="capitalize text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TOP CONTENT TABLE */}
        <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Based on real recorded metrics</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topContent.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Database className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  No data available for this period.
                </div>
              ) : (
                topContent.map((item, i) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm font-bold text-muted-foreground/50 w-6">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 capitalize opacity-70 border-0 bg-muted"
                          >
                            {item.platform}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {item.createdAt
                              ? format(new Date(item.createdAt), "MMM d")
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        {(item.metrics?.views || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* VIEWS BY PLATFORM */}
        <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Views by Platform</CardTitle>
            <CardDescription>Total viewership breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewsByPlatformData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.1}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="views" radius={[0, 4, 4, 0]} barSize={32}>
                    {viewsByPlatformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
