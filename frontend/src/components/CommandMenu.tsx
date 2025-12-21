'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Calculator, Calendar, CreditCard, Settings, User, Dumbbell,
  LayoutDashboard, LogOut, Plus, Search, Zap, Youtube, Twitter,
  FileText, Brain, Target, Terminal, ArrowRight, Wallet
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();
  const [val, setVal] = React.useState('');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Smart Detection for "Direct Action" commands
  const isLogCommand = val.toLowerCase().startsWith('log ');
  const isTrackCommand = val.toLowerCase().startsWith('track ');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-indigo-500/10 before:via-transparent before:to-transparent before:pointer-events-none">
          
          <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              <span>System Command Line // v2.0</span>
              <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
          </div>

          <Command loop className="w-full bg-transparent font-mono" shouldFilter={!isLogCommand && !isTrackCommand}>
            
            <div className="flex items-center border-b border-zinc-800 px-4" cmdk-input-wrapper="">
              <Terminal className="mr-3 h-5 w-5 shrink-0 text-indigo-500 animate-pulse" />
              <Command.Input 
                value={val}
                onValueChange={setVal}
                placeholder="Type a command (e.g., 'log', 'go', 'track')..."
                className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-zinc-600 text-white disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              {val && (
                  <Badge variant="secondary" className="font-mono text-[10px] bg-zinc-800 text-zinc-400">ENTER to Execute</Badge>
              )}
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-12 text-center text-sm text-zinc-500">
                  <div className="mb-2">Unknown command sequence.</div>
                  <div className="text-xs opacity-50">Try searching for 'Navigation' or 'Settings'</div>
              </Command.Empty>
              
              {/* SMART COMMAND PREVIEWS */}
              {isLogCommand && (
                  <Command.Group heading="Direct Action Protocol">
                      <CommandItem onSelect={() => { console.log('Log Expense:', val); setOpen(false); }}>
                          <Wallet className="mr-2 h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500 font-bold mr-2">LOG EXPENSE:</span> "{val.replace('log ', '')}"
                          <ArrowRight className="ml-auto w-4 h-4 text-zinc-600" />
                      </CommandItem>
                  </Command.Group>
              )}

              {isTrackCommand && (
                  <Command.Group heading="Direct Action Protocol">
                      <CommandItem onSelect={() => { console.log('Track:', val); setOpen(false); }}>
                          <Dumbbell className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="text-blue-500 font-bold mr-2">TRACK SESSION:</span> "{val.replace('track ', '')}"
                          <ArrowRight className="ml-auto w-4 h-4 text-zinc-600" />
                      </CommandItem>
                  </Command.Group>
              )}


              <Command.Group heading="Suggestions" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/today'))}>
                  <Badge variant="outline" className="mr-3 border-green-500/30 text-green-500 bg-green-500/10 text-[10px] w-12 justify-center">GO</Badge>
                  Today's Mission
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/finance/overview'))}>
                   <Badge variant="outline" className="mr-3 border-blue-500/30 text-blue-500 bg-blue-500/10 text-[10px] w-12 justify-center">VIEW</Badge>
                  Financial CFO
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/vault?new=true'))}>
                   <Badge variant="outline" className="mr-3 border-purple-500/30 text-purple-500 bg-purple-500/10 text-[10px] w-12 justify-center">NEW</Badge>
                   Create Knowledge Node
                </CommandItem>
              </Command.Group>

              <Command.Group heading="Navigation modules" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider mt-2">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                  <Dumbbell className="mr-3 h-4 w-4" /> Fitness Tracker
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits'))}>
                  <Target className="mr-3 h-4 w-4" /> Atomic Habits
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/knowledge'))}>
                  <Brain className="mr-3 h-4 w-4" /> Neural Network
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content'))}>
                  <Youtube className="mr-3 h-4 w-4" /> Content Studio
                </CommandItem>
              </Command.Group>

               <Command.Group heading="System Controls" className="text-zinc-500 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider mt-2">
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                   <span className="mr-3 text-lg">☀️</span> Light Mode
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                   <span className="mr-3 text-lg">🌙</span> Dark Mode
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => logout())}>
                  <LogOut className="mr-3 h-4 w-4 text-red-500" /> <span className="text-red-500">Terminate Session</span>
                </CommandItem>
              </Command.Group>

            </Command.List>
            
            <div className="border-t border-zinc-800 px-4 py-2 text-[10px] font-mono text-zinc-500 bg-zinc-900/50 flex justify-between items-center">
                 <div className="flex gap-4">
                     <span className="flex items-center hover:text-white cursor-pointer"><span className="bg-zinc-800 px-1 rounded text-zinc-300 mr-1">↵</span> Select</span>
                     <span className="flex items-center hover:text-white cursor-pointer"><span className="bg-zinc-800 px-1 rounded text-zinc-300 mr-1">↑↓</span> Navigate</span>
                 </div>
                 <span>OL-OS KERNEL</span>
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
            className="flex items-center px-4 py-3 text-sm font-medium text-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-800/80 hover:text-white transition-all aria-selected:bg-zinc-800 aria-selected:text-white aria-selected:translate-x-1 duration-200"
        >
            {children}
        </Command.Item>
    )
}
