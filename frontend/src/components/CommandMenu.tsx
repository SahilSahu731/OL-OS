'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  CreditCard, User, Dumbbell,
  LayoutDashboard, LogOut, Zap, Youtube,
  Brain, Target, Terminal, ArrowRight, Sparkles, Trophy,
  PanelRight, SlidersHorizontal, RotateCcw, Moon, Sun, Wind, Clock3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCortexStore } from '@/stores/cortexStore'; // Import the store
import { useAtmosphereStore } from '@/stores/atmosphereStore';
import { useWidgetStore } from '@/stores/widgetStore';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function CommandMenu() {
  // Use global store instead of local state
  const { isOpen, setOpen, toggle } = useCortexStore(); 
  const router = useRouter();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();
  const { setMode } = useAtmosphereStore();
  const { toggleDock, setCustomizerOpen, resetWidgets } = useWidgetStore();
  const [val, setVal] = React.useState('');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Cmd+J
      if ((e.key === 'k' || e.key === 'j') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [setOpen]);

  // --- CORTEX INTELLIGENCE ---

  const handleDeepThought = (input: string) => {
      const lower = input.toLowerCase();
      
      // Fitness Logic
      if (lower.includes('workout') || lower.includes('gym') || lower.includes('lift') || lower.match(/log .* set/)) {
          toast.success("Initiating Workout Protocol...");
          router.push('/dashboard/fitness/track');
          return true;
      }
      
      // Finance Logic
      if (lower.match(/spent \$\d+/) || lower.match(/buy .*/) || lower.includes('budget')) {
           toast.success("Opening Finance Ledger...");
           router.push('/dashboard/finance/overview');
           return true; 
      }

      // Content Logic
      if (lower.startsWith('idea') || lower.includes('video') || lower.includes('post')) {
          toast.success("Accessing Content Neural Net...");
          router.push('/dashboard/content/youtube?action=new');
          return true;
      }

      // Challenge Logic
      if (lower.includes('streak') || lower.includes('challenge') || lower.includes('fail')) {
          toast.success("Entering The War Room...");
          router.push('/dashboard/habits/challenges');
          return true;
      }

      return false;
  };

  const executeInput = () => {
      if (!val) return;
      const handled = handleDeepThought(val);
      if (!handled) {
          toast("Cortex is still learning this command pattern.");
      }
      setOpen(false);
      setVal('');
  }


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative ring-1 ring-white/10">
          
          {/* Header */}
          <div className="bg-zinc-900/30 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>Cortex AI // v3.0 // Ready</span>
              </div>
              <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Online</span>
              </div>
          </div>

          <Command loop className="w-full bg-transparent font-sans" shouldFilter={true}>
            
            <div className="flex items-center border-b border-zinc-800 px-4 py-1" cmdk-input-wrapper="">
              <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <Command.Input 
                value={val}
                onValueChange={setVal}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        // If no item is selected (cmdk handles selection), we might want to force execute
                        // But cmdk usually selects the first item. 
                        // We will add a manual 'Execute' item at the top when typing.
                    }
                }}
                placeholder="Ask Cortex to log stats, navigate, or track ideas..."
                className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-zinc-600 text-zinc-100 font-medium"
              />
              <div className="flex items-center gap-2">
                 {val && <Badge variant="secondary" className="font-mono text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer" onClick={executeInput}>⏎ RUN</Badge>}
                 <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">ESC</kbd>
              </div>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-zinc-800">
              <Command.Empty className="py-12 text-center text-sm text-zinc-500">
                  {val ? (
                      <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800">
                              <Brain className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div>
                              <p className="text-zinc-300 font-medium">No direct command found.</p>
                              <p className="text-xs text-zinc-500 mt-1">Press <span className="text-zinc-400 font-mono">ENTER</span> to let Cortex process: <span className="text-purple-400">&quot;{val}&quot;</span></p>
                          </div>
                          <button 
                            onClick={executeInput}
                            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition-colors"
                          >
                              Auto-Process Request
                          </button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-2 opacity-50">
                          <Terminal className="w-8 h-8 text-zinc-700" />
                          <span>Waiting for input...</span>
                      </div>
                  )}
              </Command.Empty>
              
              {/* IF TYPING, SHOW EXECUTE OPTION AT TOP */}
              {val && (
                  <Command.Group heading="Cortex Processing">
                      <CommandItem onSelect={executeInput}>
                          <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                          <span className="text-purple-100 font-medium mr-2">Process with Cortex AI:</span> 
                          <span className="text-zinc-400 truncate">&quot;{val}&quot;</span>
                      </CommandItem>
                  </Command.Group>
              )}

              <Command.Group heading="Suggested Actions" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/today'))}>
                  <LayoutDashboard className="mr-3 h-4 w-4 text-white" />
                  <span>Today&apos;s Dashboard</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/now'))}>
                  <Clock3 className="mr-3 h-4 w-4 text-cyan-400" />
                  <span>Open Now Engine</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits/challenges'))}>
                   <Trophy className="mr-3 h-4 w-4 text-yellow-500" />
                   <span>Access War Room (Challenges)</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content/youtube?action=new'))}>
                   <Zap className="mr-3 h-4 w-4 text-blue-500" />
                   <span>Quick Capture Idea</span>
                </CommandItem>
              </Command.Group>

              <Command.Separator className="h-px bg-zinc-800/50 my-2" />

              <Command.Group heading="OS Overlay" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                <CommandItem onSelect={() => runCommand(() => toggleDock())}>
                  <PanelRight className="mr-3 h-4 w-4 text-cyan-400" />
                  <span>Toggle Widget Dock</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setCustomizerOpen(true))}>
                  <SlidersHorizontal className="mr-3 h-4 w-4 text-purple-400" />
                  <span>Customize Widgets</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => resetWidgets())}>
                  <RotateCcw className="mr-3 h-4 w-4 text-amber-400" />
                  <span>Reset Widget Layout</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setMode('focus'))}>
                  <Moon className="mr-3 h-4 w-4 text-blue-400" />
                  <span>Atmosphere: Focus</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setMode('energy'))}>
                  <Sun className="mr-3 h-4 w-4 text-orange-400" />
                  <span>Atmosphere: Energy</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setMode('zen'))}>
                  <Wind className="mr-3 h-4 w-4 text-emerald-400" />
                  <span>Atmosphere: Zen</span>
                </CommandItem>
              </Command.Group>

              <Command.Separator className="h-px bg-zinc-800/50 my-2" />

              <Command.Group heading="Navigation" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                  <Dumbbell className="mr-3 h-4 w-4" /> Fitness Tracker
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits/track'))}>
                  <Target className="mr-3 h-4 w-4" /> Atomic Habits
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/knowledge'))}>
                  <Brain className="mr-3 h-4 w-4" /> Second Brain
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content'))}>
                  <Youtube className="mr-3 h-4 w-4" /> Content Studio
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/finance/overview'))}>
                  <CreditCard className="mr-3 h-4 w-4" /> Finance Hub
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/profile'))}>
                  <User className="mr-3 h-4 w-4" /> Identity & Profile
                </CommandItem>
              </Command.Group>

               <Command.Group heading="System" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider mt-2">
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                   <span className="mr-3 text-lg">☀️</span> Light Mode
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                   <span className="mr-3 text-lg">🌙</span> Dark Mode
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => logout())}>
                  <LogOut className="mr-3 h-4 w-4 text-red-500" /> <span className="text-red-500">Terminate Protocol</span>
                </CommandItem>
              </Command.Group>

            </Command.List>
            
            <div className="border-t border-zinc-800 px-4 py-2 text-[10px] font-mono text-zinc-500 bg-zinc-900/50 flex justify-between items-center backdrop-blur-xl">
                 <div className="flex gap-4">
                     <span className="flex items-center hover:text-white cursor-pointer"><span className="bg-zinc-800 px-1 rounded text-zinc-300 mr-1 shadow-sm">↵</span> Execute</span>
                     <span className="flex items-center hover:text-white cursor-pointer"><span className="bg-zinc-800 px-1 rounded text-zinc-300 mr-1 shadow-sm">↑↓</span> Select</span>
                 </div>
                 <span className="opacity-50">OL-OS CORTEX</span>
            </div>

          </Command>
      </div>
    </div>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item 
            onSelect={onSelect}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-lg cursor-pointer hover:bg-zinc-800 hover:text-white transition-all aria-selected:bg-zinc-800 aria-selected:text-white aria-selected:pl-6 duration-200 group"
        >
            {children}
            <ArrowRight className="ml-auto w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-600" />
        </Command.Item>
    )
}
