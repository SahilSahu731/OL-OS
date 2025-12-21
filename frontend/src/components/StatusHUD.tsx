'use client';

import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { ModeToggle } from '@/components/mode-toggle';
import { useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, Activity, Zap, Menu, PanelRight, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface StatusHUDProps {
    onMobileMenuClick?: () => void;
    onToggleRightSidebar?: () => void;
}

export function StatusHUD({ onMobileMenuClick, onToggleRightSidebar }: StatusHUDProps) {
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();

  const { summary, fetchSummary } = useFinanceStore();
  const { tasks, logs, fetchTasks, fetchLogs } = useTaskStore();

  useEffect(() => {
    fetchSummary();
    fetchTasks();
    const today = new Date();
    fetchLogs(format(today, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  }, []);

  // Calculate Daily Score
  const dailyScore = useMemo(() => {
      if (!tasks.length) return 0;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const completed = tasks.filter(t => logs[`${t._id}-${todayStr}`]).length;
      return Math.round((completed / tasks.length) * 100);
  }, [tasks, logs]);

  // Level Progress
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const progressToNext = Math.min(100, ((xp % 1000) / 1000) * 100);

  return (
    <div className="flex w-full items-center justify-between px-4 md:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40 transition-all">
        
        {/* LEFT: Mobile Toggle & Context */}
        <div className="flex items-center gap-4">
            <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={onMobileMenuClick} className="hover:bg-accent">
                    <Menu className="w-5 h-5" />
                </Button>
            </div>
            
            <div className="hidden md:flex flex-col">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>System Online</span>
                </div>
                <h2 className="text-sm font-bold text-foreground">{format(new Date(), 'EEEE, MMMM do')}</h2>
            </div>
        </div>

        {/* CENTER: Heads-Up Display */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar mask-gradient px-2">
            
            {/* 1. XP / Level */}
            <div className="flex flex-col w-32 md:w-40 gap-1.5 group cursor-help" title={`Level ${level} - ${xp} Total XP`}>
                <div className="flex justify-between items-end text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
                    <span className="flex items-center gap-1 group-hover:text-primary transition-colors"><Zap className="w-3 h-3 text-amber-500" /> SVC Lvl {level}</span>
                    <span className="font-mono">{Math.floor(progressToNext)}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                        style={{ width: `${progressToNext}%` }} 
                    />
                </div>
            </div>
            
            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* 2. Financials */}
            <div className="hidden md:flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                    <Coins className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Net Worth</span>
                    <span className="text-sm font-bold font-mono leading-none tracking-tight">{formatCurrencyValue(summary.balance, currency)}</span>
                </div>
            </div>

            <Separator orientation="vertical" className="h-8 hidden md:block" />

            {/* 3. Daily Sync */}
            <div className="hidden md:flex items-center gap-3 group">
                 <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Daily Sync</span>
                    <span className={cn("text-sm font-bold font-mono leading-none tracking-tight", dailyScore === 100 ? 'text-emerald-500' : 'text-foreground')}>
                        {dailyScore}%
                    </span>
                </div>
            </div>

        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
             {/* Command Search Trigger (Visual Only, functional CMD+K handles logic) */}
            <Button 
                variant="outline" 
                size="sm" 
                className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground h-9 px-3 bg-secondary/50 border-secondary-foreground/10"
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
                <Search className="w-3.5 h-3.5" />
                <span className="text-xs">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/50">
                <ModeToggle />
                <Separator orientation="vertical" className="h-5" />
                <Button variant="ghost" size="icon" onClick={onToggleRightSidebar} className="h-8 w-8 hover:bg-background rounded-md">
                    <PanelRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    </div>
  );
}
