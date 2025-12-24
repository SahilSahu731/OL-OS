'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useCortexStore } from '@/stores/cortexStore';
import { 
    Brain, Calendar, CheckSquare, CreditCard, Dumbbell, 
    FileText, Hash, Home, LayoutDashboard, Search, Settings, 
    Sparkles, Trophy, User, Video, Zap 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export function Cortex() {
    const router = useRouter();
    const { isOpen, toggle, setOpen } = useCortexStore();
    const { setTheme } = useTheme();
    const [inputValue, setInputValue] = React.useState('');

    // Toggle with Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
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

    // Simple "AI" Parsing logic
    const handleSmartInput = (input: string) => {
        const lower = input.toLowerCase();
        
        if (lower.includes('log workout') || lower.includes('fitness')) {
            router.push('/dashboard/fitness/track');
            toast.success("Opening Fitness Tracker...");
            return true;
        }
        if (lower.includes('content') || lower.includes('video') || lower.includes('youtube')) {
            router.push('/dashboard/content/youtube');
            toast.success("Opening Content Studio...");
            return true;
        }
        if (lower.includes('finance') || lower.includes('money') || lower.includes('budget')) {
            router.push('/dashboard/finance/overview');
            toast.success("Opening Finance Hub...");
            return true;
        }
        if (lower.includes('habit') || lower.includes('streak')) {
            router.push('/dashboard/habits');
            toast.success("Opening Habit Lab...");
            return true;
        }
        
        return false;
    };

    return (
        <Command.Dialog
            open={isOpen}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            contentClassName="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
        >
            <div className="flex items-center border-b border-zinc-800 px-4 py-3 bg-zinc-950/50">
                <Brain className="w-5 h-5 text-purple-500 mr-3 animate-pulse" />
                <Command.Input 
                    value={inputValue}
                    onValueChange={setInputValue}
                    placeholder="Ask Cortex or search commands..."
                    className="flex-1 bg-transparent border-0 outline-none text-lg text-zinc-100 placeholder:text-zinc-500 font-medium"
                />
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-mono font-medium rounded bg-zinc-900 border border-zinc-800 text-zinc-500">ESC</kbd>
                </div>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    {inputValue ? (
                        <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-500/50" />
                            <p>Cortex is thinking...</p>
                            <button 
                                onClick={() => {
                                    const handled = handleSmartInput(inputValue);
                                    if (!handled) toast("Cortex is still learning this command.");
                                    setOpen(false);
                                }}
                                className="mt-2 text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-500/20 transition-colors"
                            >
                                Execute "{inputValue}"
                            </button>
                        </div>
                    ) : (
                        "No results found."
                    )}
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits'))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Habit Lab</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits/challenges'))}>
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Challenges (War Room)</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/finance/overview'))}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Finance Hub</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content/youtube'))}>
                        <Video className="mr-2 h-4 w-4" />
                        <span>Content Studio</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                        <Dumbbell className="mr-2 h-4 w-4" />
                        <span>Fitness Tracker</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/knowledge'))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Second Brain</span>
                    </CommandItem>
                </Command.Group>

                <Command.Separator className="h-px bg-zinc-800 my-2" />

                <Command.Group heading="Quick Actions" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/content/youtube?action=new'))}>
                        <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Draft New Idea</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fitness/track'))}>
                        <Dumbbell className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>Log Workout</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/habits/challenges'))}>
                        <Trophy className="mr-2 h-4 w-4 text-red-500" />
                        <span>View Challenges</span>
                    </CommandItem>
                </Command.Group>

                <Command.Separator className="h-px bg-zinc-800 my-2" />

                <Command.Group heading="System" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <span>Dark Mode</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <span>Light Mode</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/profile'))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile & Stats</span>
                    </CommandItem>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
}

// Helper wrapper for styling
function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item 
            onSelect={onSelect}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-white cursor-pointer transition-colors aria-selected:bg-zinc-800 aria-selected:text-white"
        >
            {children}
        </Command.Item>
    );
}
