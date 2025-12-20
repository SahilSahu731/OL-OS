'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { HabitNav } from '@/components/HabitNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subYears, eachDayOfInterval, getDay, isSameDay, startOfYear, endOfYear, getMonth, getDate } from 'date-fns';
import { TrendingUp, Zap, Target, Trophy, Activity, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Brush
} from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden"
  >
    <Card className="h-full border-border/50 bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:border-primary/20 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-full bg-secondary/50 group-hover:bg-primary/20 transition-colors", colorClass)}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </div>
            {trend && (
                <div className="flex items-center text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {trend}
                </div>
            )}
        </div>
      </CardContent>
      {/* Decorative gradient blob */}
      <div className="absolute -right-12 -top-12 h-24 w-24 bg-primary/10 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-all" />
    </Card>
  </motion.div>
);

const Heatmap = ({ data, startDate, endDate }: { data: any[], startDate: Date, endDate: Date }) => {
    // Generate a full year grid or range grid
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group by month for labels
    const months = useMemo(() => {
        const m: { name: string; index: number }[] = [];
        let currentMonth = -1;
        days.forEach((day, index) => {
            const month = getMonth(day);
            if (month !== currentMonth) {
                m.push({ name: format(day, 'MMM'), index });
                currentMonth = month;
            }
        });
        return m;
    }, [days]);

    // Determine intensity
    const getIntensity = (score: number) => {
        if (score === 0) return 'bg-secondary/50'; 
        if (score < 4) return 'bg-cyan-300 dark:bg-cyan-900/60';
        if (score < 8) return 'bg-blue-400 dark:bg-blue-700/80';
        if (score < 12) return 'bg-indigo-500 dark:bg-indigo-600';
        return 'bg-violet-600 dark:bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]';
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="flex text-xs text-muted-foreground mb-2">
                    {months.map((m, i) => (
                        <div key={i} style={{ marginLeft: i === 0 ? 0 : 20, width: 40 }}>{m.name}</div>
                    ))}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {days.map((day, i) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayData = data.find(d => d.fullDate === dateStr);
                        const score = dayData ? dayData.score : 0;
                        return (
                            <div 
                                key={dateStr} 
                                className={cn("h-3 w-3 rounded-sm transition-all hover:scale-125 hover:ring-2 ring-ring/50", getIntensity(score))}
                                title={`${dateStr}: ${score} pts`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
  const { tasks, logs, metrics, fetchLogs, fetchMetrics } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  // Date State
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 89), 'yyyy-MM-dd')); // Default to 90 days for better heatmap
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateRangePreset, setDateRangePreset] = useState('90');
  const [scoreChartType, setScoreChartType] = useState<'bar' | 'line' | 'combined'>('combined');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Preset Change
  const handlePresetChange = (value: string) => {
      setDateRangePreset(value);
      const end = new Date();
      let start = new Date();
      
      switch (value) {
          case '7': start = subDays(end, 6); break;
          case '14': start = subDays(end, 13); break;
          case '30': start = subDays(end, 29); break;
          case '90': start = subDays(end, 89); break;
          case '365': start = subYears(end, 1); break;
          case 'ytd': start = startOfYear(end); break;
          default: return;
      }
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
  };

  useEffect(() => {
    fetchLogs(startDate, endDate);
    fetchMetrics(startDate, endDate);
  }, [startDate, endDate, fetchLogs, fetchMetrics]);

  // Derived Data Calculation
  const days = useMemo(() => eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) }), [startDate, endDate]);

  const dailyData = useMemo(() => days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let completedCount = 0;
    tasks.forEach(task => {
        if (logs[`${task._id}-${dateStr}`]) completedCount++;
    });
    const score = completedCount * 2; 
    
    return {
        date: format(day, 'MMM dd'),
        fullDate: dateStr,
        dayOfWeek: getDay(day), 
        score,
        weight: metrics[dateStr]?.weight || null,
        hp: metrics[dateStr]?.hp || null
    };
  }), [days, tasks, logs, metrics]);

  // Monthly Data Calculation
  const monthlyData = useMemo(() => {
      const data: Record<string, { date: string; score: number; count: number }> = {};
      dailyData.forEach(d => {
          const monthKey = format(new Date(d.fullDate), 'yyyy-MM');
          if (!data[monthKey]) {
              data[monthKey] = { date: format(new Date(d.fullDate), 'MMM yyyy'), score: 0, count: 0 };
          }
          data[monthKey].score += d.score;
          data[monthKey].count++;
      });
      return Object.values(data).map(d => ({
          ...d,
          average: Math.round(d.score / d.count)
      }));
  }, [dailyData]);

  const habitPerformance = useMemo(() => tasks.map(task => {
      let count = 0;
      days.forEach(day => {
          if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) count++;
      });
      return { name: task.title, value: count, category: task.category };
  }).filter(d => d.value > 0).sort((a,b) => b.value - a.value), [tasks, days, logs]);

  const categoryStats = useMemo(() => {
      const stats: Record<string, number> = {};
      habitPerformance.forEach(h => {
          let catName = 'Uncategorized';
          if (typeof h.category === 'object' && h.category && 'name' in h.category) {
              catName = (h.category as any).name;
          } else if (h.category && typeof h.category === 'string') {
              const found = categories.find(c => c._id === h.category);
              if (found) catName = found.name;
          }
          stats[catName] = (stats[catName] || 0) + h.value;
      });
      return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [habitPerformance, categories]);

  // Category Proficiency Calculation
  const categoryProficiency = useMemo(() => {
      const catStats: Record<string, { completed: number; total: number }> = {};
      tasks.forEach(task => {
           let catName = 'Uncategorized';
           if (typeof task.category === 'object' && task.category && 'name' in task.category) {
               catName = (task.category as any).name;
           } else if (task.category && typeof task.category === 'string') {
               const found = categories.find(c => c._id === task.category);
               if (found) catName = found.name;
           }
           
           if (!catStats[catName]) catStats[catName] = { completed: 0, total: 0 };

           days.forEach(day => {
               catStats[catName].total++;
               if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                   catStats[catName].completed++;
               }
           });
      });

      return Object.entries(catStats).map(([name, data]) => ({
          name,
          rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })).sort((a,b) => b.rate - a.rate);
  }, [tasks, days, logs, categories]);

  // Radar Data
  const weekDayData = useMemo(() => {
      const dayStats = [0,0,0,0,0,0,0];
      const dayCounts = [0,0,0,0,0,0,0];
      dailyData.forEach(d => {
          dayStats[d.dayOfWeek] += d.score;
          dayCounts[d.dayOfWeek]++;
      });
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((subject, i) => ({
          subject,
          score: dayCounts[i] ? Math.round(dayStats[i]/dayCounts[i]) : 0,
          fullMark: 100
      }));
  }, [dailyData]);

  // Stats
  const totalScore = dailyData.reduce((acc, d) => acc + d.score, 0);
  const avgScore = days.length > 0 ? Math.round(totalScore / days.length) : 0;
  const bestScore = Math.max(...dailyData.map(d => d.score), 0);
  const completionRate = (tasks.length * days.length) > 0 
    ? Math.round((habitPerformance.reduce((acc, curr) => acc + curr.value, 0) / (tasks.length * days.length)) * 100) 
    : 0;

  // Calculate Streaks (Current & Best in period)
  let currentStreak = 0;
  let maxStreak = 0;
  dailyData.forEach(d => {
      if (d.score > 0) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
          currentStreak = 0;
      }
  });

  // Chart Config
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];
  const CHART_Tooltip = {
      contentStyle: { 
        backgroundColor: 'var(--color-popover)', 
        borderColor: 'var(--color-border)', 
        color: 'var(--color-popover-foreground)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        padding: '8px 12px'
      },
      itemStyle: { color: 'var(--color-foreground)' }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Habit Analytics
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Deep dive into your performance, consistency, and health metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-background/50 backdrop-blur-sm p-1.5 rounded-lg border shadow-sm">
            <Select value={dateRangePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[140px] h-9 bg-transparent border-none hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="14">Last 14 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>

            {dateRangePreset === 'custom' && (
                 <div className="flex items-center gap-2 border-l pl-2 mr-2">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-auto text-xs" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-auto text-xs" />
                </div>
            )}
        </div>
      </div>

      <HabitNav />

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Score" 
            value={totalScore} 
            subtext={`Avg: ${avgScore} / Best: ${bestScore}`} 
            icon={Trophy} 
            colorClass="text-yellow-500"
        />
        <StatCard 
            title="Completion Rate" 
            value={`${completionRate}%`} 
            subtext="Consistency Score" 
            icon={Target} 
            colorClass="text-blue-500"
        />
        <StatCard 
            title="Active Streak" 
            value={`${currentStreak} Days`} 
            subtext={`Best: ${maxStreak} Days`} 
            icon={Zap} 
            colorClass="text-amber-500"
        />
        <StatCard 
            title="Perfect Days" 
            value={dailyData.filter(d => d.score > 0 && d.score >= (tasks.length * 2)).length} 
            subtext="100% Habit Completion" 
            icon={Activity} 
            colorClass="text-emerald-500"
        />
      </div>

      {/* MAIN CHART SECTION */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* SCORE TREND */}
        <Card className="col-span-12 lg:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle>Productivity Trend</CardTitle>
                <CardDescription>Daily scores over time.</CardDescription>
            </div>
            <Select value={scoreChartType} onValueChange={(v: any) => setScoreChartType(v)}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="combined">Combined</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-0 pt-4">
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorScoreBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            </linearGradient>
                            <linearGradient id="colorScoreLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                        
                        {(scoreChartType === 'bar' || scoreChartType === 'combined') && (
                            <Bar dataKey="score" name="Daily Score" fill="url(#colorScoreBar)" radius={[4, 4, 0, 0]} barSize={20} />
                        )}
                        {(scoreChartType === 'line' || scoreChartType === 'combined') && (
                            <Area type="monotone" dataKey="score" name="Trend" stroke="#ec4899" strokeWidth={3} fill="url(#colorScoreLine)" dot={false} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* WEEKLY PATTERN */}
        <Card className="col-span-12 lg:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Consistency Radar</CardTitle>
            <CardDescription>Performance by day of week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weekDayData}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                        <Tooltip {...CHART_Tooltip} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MONTHLY & CATEGORY PROFICIENCY (NEW) */}
      <div className="grid gap-6 md:grid-cols-2">
           {/* MONTHLY AVERAGE */}
           <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
               <CardHeader>
                   <CardTitle>Monthly Progress</CardTitle>
                   <CardDescription>Average daily score per month.</CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={monthlyData}>
                               <defs>
                                   <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                       <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                               <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                               <Bar dataKey="average" name="Avg Score" fill="url(#colorMonth)" radius={[4, 4, 0, 0]} barSize={32} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </CardContent>
           </Card>

           {/* CATEGORY PROFICIENCY */}
           <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
               <CardHeader>
                   <CardTitle>Category Proficiency</CardTitle>
                   <CardDescription>Completion rate by category.</CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={categoryProficiency} layout="vertical" margin={{ left: 20 }}>
                               <XAxis type="number" domain={[0, 100]} hide />
                               <YAxis dataKey="name" type="category" width={100} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip {...CHART_Tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                               <Bar dataKey="rate" name="Completion Rate (%)" radius={[0, 4, 4, 0]} barSize={20}>
                                    {categoryProficiency.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </CardContent>
           </Card>
      </div>

      {/* HEATMAP SECTION */}
      <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Activity Heatmap
              </CardTitle>
              <CardDescription>Visualizing your daily habit density over the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
              <Heatmap data={dailyData} startDate={new Date(startDate)} endDate={new Date(endDate)} />
          </CardContent>
      </Card>

      {/* CATEGORY & HEALTH */}
      <div className="grid gap-6 md:grid-cols-12">
          
          {/* CATEGORY DONUT */}
          <Card className="col-span-12 md:col-span-4 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Volume of habits by category.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={categoryStats} 
                                cx="50%" cy="40%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value" 
                                stroke="none"
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...CHART_Tooltip} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={80} 
                                content={({ payload }) => {
                                    if (!payload) return null;
                                    return (
                                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-4 px-2">
                                            {payload.map((entry: any, index: number) => (
                                                <div key={`item-${index}`} className="flex items-center gap-1.5 min-w-0 max-w-[120px]">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-xs text-muted-foreground truncate" title={entry.value}>
                                                        {entry.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* HEALTH CORRELATION */}
          <Card className="col-span-12 md:col-span-8 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Health vs Productivity</CardTitle>
                <CardDescription>Analyzing the impact of habits on weight and HP.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="colorHp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" orientation="left" domain={['auto', 'auto']} tickFormatter={(v) => `${v}kg`}/>
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" domain={[0, 10]} />
                            <Tooltip {...CHART_Tooltip} />
                            <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWeight)" name="Weight" connectNulls />
                            <Area yAxisId="right" type="monotone" dataKey="hp" stroke="#10b981" fillOpacity={1} fill="url(#colorHp)" name="HP" connectNulls />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* HABIT TABLE & COMPARISON */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
             <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Habit Performance & Comparison
                </h2>
                <p className="text-muted-foreground mt-1">
                    Analyze individual habits and compare their consistency.
                </p>
             </div>
             {selectedTasks.length > 0 && (
                 <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border/50 animate-in slide-in-from-right-10 fade-in">
                     <span className="text-sm font-medium px-2">{selectedTasks.length} selected</span>
                     <Button 
                        size="sm" 
                        variant={showComparison ? "secondary" : "default"}
                        onClick={() => setShowComparison(!showComparison)}
                        className="h-8"
                     >
                        {showComparison ? "Hide Comparison" : "Compare Analytics"}
                     </Button>
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setSelectedTasks([]); setShowComparison(false); }}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                     >
                        Clear
                     </Button>
                 </div>
             )}
         </div>

         {/* COMPARISON VIEW */}
         {showComparison && selectedTasks.length > 0 && (
             <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
             >
                <Card className="border-border/50 bg-background/60 backdrop-blur-xl mb-8 border-primary/20 shadow-lg shadow-primary/5">
                    <CardHeader>
                        <CardTitle>Comparative Analysis</CardTitle>
                        <CardDescription>Comparing consistency trends over the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                                    <XAxis 
                                        dataKey="date" 
                                        type="category"
                                        allowDuplicatedCategory={false}
                                        stroke="var(--color-muted-foreground)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        ticks={days.filter((_, i) => i % Math.ceil(days.length / 10) === 0).map(d => format(d, 'yyyy-MM-dd'))}
                                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                    />
                                    <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                    <Tooltip 
                                        trigger="hover"
                                        contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', color: 'var(--color-popover-foreground)' }}
                                    />
                                    <Legend />
                                    {selectedTasks.map((taskId, index) => {
                                        const task = tasks.find(t => t._id === taskId);
                                        if (!task) return null;
                                        
                                        // Calculate rolling average for the chart
                                        const data = days.map((day, dIndex) => {
                                            const windowStart = Math.max(0, dIndex - 6);
                                            const windowEnd = dIndex + 1;
                                            const windowDays = days.slice(windowStart, windowEnd);
                                            
                                            let completedInWindow = 0;
                                            windowDays.forEach(wd => {
                                                if (logs[`${task._id}-${format(wd, 'yyyy-MM-dd')}`]) completedInWindow++;
                                            });
                                            
                                            return {
                                                date: format(day, 'yyyy-MM-dd'),
                                                value: Math.round((completedInWindow / windowDays.length) * 100)
                                            };
                                        });

                                        return (
                                            <Line 
                                                key={task._id}
                                                data={data}
                                                type="monotone" 
                                                dataKey="value" 
                                                name={task.title} 
                                                stroke={COLORS[index % COLORS.length]} 
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6 }}
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Stat Comparison */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                            {selectedTasks.map((taskId, index) => {
                                const task = tasks.find(t => t._id === taskId);
                                if (!task) return null;
                                
                                let completed = 0;
                                let currentStreak = 0;
                                days.forEach(day => {
                                    if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                                        completed++;
                                        currentStreak++;
                                    } else {
                                        currentStreak = 0;
                                    }
                                });
                                const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;

                                return (
                                    <div key={task._id} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <p className="font-semibold text-sm truncate" title={task.title}>{task.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Rate</span>
                                                <span className="font-mono font-medium">{rate}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Total</span>
                                                <span className="font-mono font-medium">{completed}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Streak</span>
                                                <span className="font-mono font-medium">{currentStreak}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
             </motion.div> 
         )}

         {/* MAIN TABLE */}
         <Card className="border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/40 text-muted-foreground font-medium border-b border-border/50">
                        <tr>
                            <th className="p-4 w-[50px]">
                                <Checkbox 
                                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                                    onCheckedChange={(checked: boolean) => {
                                        if (checked) setSelectedTasks(tasks.map(t => t._id));
                                        else setSelectedTasks([]);
                                    }}
                                />
                            </th>
                            <th className="p-4">Habit</th>
                            <th className="p-4 hidden md:table-cell">Category</th>
                            <th className="p-4 w-[250px]">Completion Rate</th>
                            <th className="p-4 text-center">Streak (Cur/Best)</th>
                            <th className="p-4 text-right">Total done</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {tasks.map((task) => {
                            let completed = 0;
                            let maxStreak = 0;
                            let currentStreak = 0;
                            days.forEach(day => {
                                if (logs[`${task._id}-${format(day, 'yyyy-MM-dd')}`]) {
                                    completed++;
                                    currentStreak++;
                                    if (currentStreak > maxStreak) maxStreak = currentStreak;
                                } else {
                                    currentStreak = 0;
                                }
                            });
                            const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
                            
                            let catName = 'None';
                            if (typeof task.category === 'object' && task.category && 'name' in task.category) {
                                catName = (task.category as any).name;
                            } else if (task.category && typeof task.category === 'string') {
                                const found = categories.find(c => c._id === task.category);
                                if (found) catName = found.name;
                            }

                            const isSelected = selectedTasks.includes(task._id);

                            return (
                                <tr 
                                    key={task._id} 
                                    className={cn(
                                        "group transition-colors hover:bg-secondary/20",
                                        isSelected && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <td className="p-4">
                                        <Checkbox 
                                            checked={isSelected}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) setSelectedTasks([...selectedTasks, task._id]);
                                                else setSelectedTasks(selectedTasks.filter(id => id !== task._id));
                                            }}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{task.title}</div>
                                        <div className="md:hidden text-xs text-muted-foreground mt-0.5">{catName}</div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <Badge variant="outline" className="font-normal bg-background/50 hover:bg-secondary/50 transition-colors">
                                            {catName}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs w-[35px] text-right">{rate}%</span>
                                            <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-500", 
                                                        rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-mono text-xs">
                                        <span className={cn(currentStreak > 0 ? "text-amber-500 font-bold" : "text-muted-foreground")}>{currentStreak}</span>
                                        <span className="text-muted-foreground/40 mx-1">/</span>
                                        <span className="text-muted-foreground">{maxStreak}</span>
                                    </td>
                                    <td className="p-4 text-right font-mono font-medium">
                                        {completed}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
         </Card>
      </div>
    </div>
  );
}
