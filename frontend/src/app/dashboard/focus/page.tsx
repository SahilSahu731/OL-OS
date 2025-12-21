'use client';

import { useEffect, useState, useRef } from 'react';
import { useFocusStore } from '@/stores/focusStore';
import { useTaskStore } from '@/stores/taskStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
    Play, Pause, Square, Maximize2, Minimize2, Flame, Wand2, Zap, Trophy, 
    Headphones, Wind, CloudRain, Waves, Volume2, Target, BrainCircuit, Activity,
    StickyNote, X, Music, ListTodo, History, Settings2, BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type VisualTheme = 'nebula' | 'cyber' | 'zen' | 'void';
type Soundscape = 'rain' | 'forest' | 'white' | 'none';

// Sound Assets (Public Domain / Creative Commons placeholders)
const SOUNDS = {
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    forest: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
    white: 'https://actions.google.com/sounds/v1/ambiences/white_noise.ogg' 
};

export default function FocusPage() {
    const { 
        status, displayTime, initialDuration, activeTaskId,
        startSession, pauseSession, resumeSession, stopSession, sync,
        updateBraindump, braindump
    } = useFocusStore();
    
    const { tasks, fetchTasks } = useTaskStore();
    
    // Local State
    const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
    const [customDuration, setCustomDuration] = useState<number>(25);
    const [intention, setIntention] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showBraindump, setShowBraindump] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [theme, setTheme] = useState<VisualTheme>('cyber');
    const [activeSound, setActiveSound] = useState<Soundscape>('none');
    const [volume, setVolume] = useState(0.5);
    
    // Audio Refs
    const completionAudio = useRef<HTMLAudioElement | null>(null);
    const ambientAudio = useRef<HTMLAudioElement | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchTasks();
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        completionAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        ambientAudio.current = new Audio();
        ambientAudio.current.loop = true;
    }, []);

    // Handle Sound Changes
    useEffect(() => {
        if (!ambientAudio.current) return;
        
        if (activeSound === 'none') {
            ambientAudio.current.pause();
            ambientAudio.current.src = "";
        } else {
            ambientAudio.current.src = SOUNDS[activeSound];
            ambientAudio.current.volume = volume;
            ambientAudio.current.play().catch(e => console.error("Audio play failed", e));
        }
    }, [activeSound]);

    useEffect(() => {
        if (ambientAudio.current) {
            ambientAudio.current.volume = volume;
        }
    }, [volume]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'running') {
            interval = setInterval(() => {
                const prevTime = useFocusStore.getState().displayTime;
                sync();
                const newTime = useFocusStore.getState().displayTime;
                if (prevTime > 0 && newTime === 0) handleCompletion();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, sync]);

    const handleCompletion = () => {
        toast.success("Protocol Complete", { description: "Focus session successfully logged." });
        if (completionAudio.current) completionAudio.current.play().catch(() => {});
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
             new Notification("Session Complete", { body: "Target duration reached." });
        }
        if (ambientAudio.current) ambientAudio.current.pause();
        setActiveSound('none');
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (status === 'running' && !showBraindump && !showStats) setShowControls(false);
        }, 3000);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.log(e));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = initialDuration > 0 ? ((initialDuration * 60 - displayTime) / (initialDuration * 60)) * 100 : 0;

    // --- THEME DEFINITIONS ---
    const THEMES = {
        cyber: {
            wrapper: "bg-black text-emerald-500 selection:bg-emerald-500/30",
            bgElement: (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl opacity-20" />
                </div>
            ),
            ring: "ring-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.1)]",
            text: "text-emerald-500",
            accent: "emerald",
        },
        nebula: {
            wrapper: "bg-[#0B0A16] text-purple-300 selection:bg-purple-500/30",
            bgElement: (
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{animationDuration: '8s'}} />
                     <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-bounce" style={{animationDuration: '15s'}} />
                 </div>
            ),
            ring: "ring-purple-500/30 shadow-[0_0_80px_-20px_rgba(168,85,247,0.3)]",
            text: "text-purple-300",
            accent: "purple",
        },
        zen: {
            wrapper: "bg-[#1c1917] text-orange-100 selection:bg-orange-500/30",
            bgElement: (
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-900/10 to-transparent" />
                 </div>
            ),
            ring: "ring-orange-500/20 shadow-[0_0_60px_-10px_rgba(249,115,22,0.1)]",
            text: "text-orange-200",
            accent: "orange",
        },
        void: {
            wrapper: "bg-black text-white selection:bg-white/20",
            bgElement: null,
            ring: "ring-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)]",
            text: "text-zinc-200",
            accent: "zinc",
        }
    };

    const currentTheme = THEMES[theme];

    // Filter incomplete tasks for the selector
    const activeTasks = tasks.filter(t => t.active);
    const currentTaskTitle = activeTaskId 
        ? tasks.find(t => t._id === activeTaskId)?.title 
        : (intention || "Deep Work Session");

    return (
        <div 
            className={cn(
                "flex flex-col items-center min-h-[calc(100vh-4rem)] transition-colors duration-700 ease-in-out font-mono overflow-hidden relative",
                isFullscreen ? `fixed inset-0 z-[100] h-screen w-screen justify-center ${currentTheme.wrapper}` : "justify-start py-8 space-y-8 bg-background"
            )}
            onMouseMove={handleMouseMove}
            onClick={() => setShowControls(true)}
        >
            
            {/* RENDER THEME BACKGROUND */}
            {(isFullscreen || status !== 'idle') && currentTheme.bgElement}
            
            {/* --- IDLE STATE: SETUP --- */}
            {status === 'idle' && (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xl z-20"
                >
                     <div className="text-center mb-10 space-y-2">
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            className="inline-flex p-4 rounded-full border border-dashed border-zinc-700 mb-4"
                        >
                            <BrainCircuit className="w-10 h-10 text-primary" />
                        </motion.div>
                        <h1 className="text-5xl font-black tracking-tighter">DEEP FOCUS</h1>
                        <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-bold">Select parameters</p>
                    </div>

                    <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                         
                         <div className="space-y-8 relative z-10">
                             
                             {/* Task Selection */}
                             <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target Objective</label>
                                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                                     <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                                         <SelectTrigger className="h-14 bg-zinc-950/50 border-zinc-700/50 text-white">
                                             <SelectValue placeholder="Select a task..." />
                                         </SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="none">Freestyle (No Task)</SelectItem>
                                             {activeTasks.map(task => (
                                                 <SelectItem key={task._id} value={task._id}>{task.title}</SelectItem>
                                             ))}
                                         </SelectContent>
                                     </Select>
                                     <Input 
                                        className="bg-zinc-950/50 border-zinc-700/50 h-14 font-bold text-center rounded-xl focus:ring-primary/50"
                                        placeholder="Or type intention..."
                                        value={intention}
                                        disabled={selectedTaskId !== 'none'}
                                        onChange={(e) => setIntention(e.target.value)} 
                                     />
                                 </div>
                             </div>

                             <div className="flex gap-4">
                                 <div className="flex-1 space-y-2">
                                     <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duration ({customDuration}m)</label>
                                     <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[customDuration]} 
                                            onValueChange={(v) => setCustomDuration(v[0])} 
                                            max={120} min={5} step={5}
                                            className="flex-1 py-4"
                                        />
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" onClick={() => setCustomDuration(25)}>25</Button>
                                            <Button size="sm" variant="outline" onClick={() => setCustomDuration(50)}>50</Button>
                                        </div>
                                     </div>
                                 </div>
                             </div>

                             <Button 
                                className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-xl bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] transition-all"
                                onClick={() => {
                                    startSession(customDuration, selectedTaskId !== 'none' ? selectedTaskId : null);
                                    if(customDuration > 10) toggleFullscreen();
                                }}
                             >
                                 Initiate Protocol
                             </Button>
                         </div>
                    </Card>
                </motion.div>
            )}

            {/* --- RUNNING STATE: ZEN INTERFACE --- */}
            {status !== 'idle' && (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-20">
                     
                     {/* OVERLAY CONTROLS */}
                     <AnimatePresence>
                         {showControls && (
                             <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 bg-gradient-to-b from-black/50 to-transparent"
                             >
                                 <div className="text-left">
                                     <div className="text-[10px] uppercase font-bold tracking-[0.2rem] opacity-50 mb-1">Target Protocol</div>
                                     <div className={cn("text-2xl font-bold leading-none flex items-center gap-2", currentTheme.text)}>
                                         {currentTaskTitle}
                                         {activeTaskId && <Badge variant="outline" className="ml-2 border-current text-current opacity-50">Task Linked</Badge>}
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                     <Button size="icon" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setShowStats(!showStats)}>
                                         <BarChart3 className="w-5 h-5" />
                                     </Button>
                                     <Button size="icon" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setShowBraindump(!showBraindump)}>
                                         <StickyNote className="w-5 h-5" />
                                     </Button>
                                     <Button size="icon" variant="ghost" className="text-white/50 hover:text-white" onClick={toggleFullscreen}>
                                         {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                     </Button>
                                     <Button size="icon" variant="ghost" className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10" onClick={stopSession}>
                                         <X className="w-5 h-5" />
                                     </Button>
                                 </div>
                             </motion.div>
                         )}
                     </AnimatePresence>

                     {/* MAIN TIMER ELEMENT */}
                     <div className="relative group">
                         {/* Ring */}
                         <div className={cn(
                             "w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-white/5 flex items-center justify-center relative transition-all duration-1000",
                             currentTheme.ring
                         )}>
                             {/* Progress SVG Ring */}
                             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                 <circle 
                                    cx="50%" cy="50%" r="48%" 
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1"
                                 />
                                 <motion.circle 
                                    initial={{ pathLength: 1 }}
                                    animate={{ pathLength: progress / 100 }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                    cx="50%" cy="50%" r="48%" 
                                    fill="none" stroke="currentColor" strokeWidth="4" className={currentTheme.text} strokeLinecap="round"
                                 />
                             </svg>

                             {/* Time Display */}
                             <div className="flex flex-col items-center">
                                  <div className={cn("text-8xl md:text-9xl font-bold tracking-tighter tabular-nums select-none", currentTheme.text)}>
                                      {formatTime(displayTime)}
                                  </div>
                                  <div className="text-sm uppercase tracking-[0.4em] opacity-40 font-bold mt-4">
                                      {status === 'paused' ? 'Halted' : 'Focusing'}
                                  </div>
                             </div>
                         </div>
                     </div>

                     {/* BOTTOM CONTROLS */}
                     <AnimatePresence>
                        {showControls && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-12 flex flex-col items-center gap-6"
                            >   
                                {/* Theme & Sound Dock */}
                                <div className="flex items-center gap-6 px-8 py-4 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
                                    
                                    {/* Play/Pause */}
                                    <button 
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-transform"
                                        onClick={status === 'running' ? pauseSession : resumeSession}
                                    >
                                        {status === 'running' ? <Pause className="fill-black w-5 h-5" /> : <Play className="fill-black ml-1 w-5 h-5" />}
                                    </button>

                                    <div className="w-px h-8 bg-white/10" />

                                    {/* Themes */}
                                    <div className="flex gap-2">
                                        {(Object.keys(THEMES) as VisualTheme[]).map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setTheme(t)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 transition-all",
                                                    t === 'cyber' ? 'bg-emerald-950 border-emerald-500' :
                                                    t === 'nebula' ? 'bg-purple-950 border-purple-500' :
                                                    t === 'zen' ? 'bg-orange-950 border-orange-500' : 'bg-zinc-950 border-zinc-500',
                                                    theme === t ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-black" : "opacity-50 hover:opacity-100"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <div className="w-px h-8 bg-white/10" />

                                    {/* Sounds */}
                                    <div className="flex gap-1">
                                        <button onClick={() => setActiveSound(activeSound === 'rain' ? 'none' : 'rain')} className={cn("p-2 rounded-lg", activeSound === 'rain' ? "bg-white/20 text-white" : "text-white/40 hover:text-white")}><CloudRain className="w-4 h-4" /></button>
                                        <button onClick={() => setActiveSound(activeSound === 'forest' ? 'none' : 'forest')} className={cn("p-2 rounded-lg", activeSound === 'forest' ? "bg-white/20 text-white" : "text-white/40 hover:text-white")}><Wind className="w-4 h-4" /></button>
                                        <button onClick={() => setActiveSound(activeSound === 'white' ? 'none' : 'white')} className={cn("p-2 rounded-lg", activeSound === 'white' ? "bg-white/20 text-white" : "text-white/40 hover:text-white")}><Waves className="w-4 h-4" /></button>
                                    </div>
                                    
                                    {/* Volume */}
                                    <div className="w-24">
                                        <Slider value={[volume]} max={1} step={0.1} onValueChange={(v) => setVolume(v[0])} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                     
                     {/* BRAINDUMP SIDEBAR */}
                     <AnimatePresence>
                         {showBraindump && (
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute right-0 top-0 bottom-0 w-[400px] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/5 p-8 shadow-2xl z-[60] flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4" /> Mental Buffer
                                    </h3>
                                    <button onClick={() => setShowBraindump(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
                                </div>
                                <Textarea 
                                     autoFocus
                                     value={braindump}
                                     onChange={(e) => updateBraindump(e.target.value)}
                                     className="flex-1 bg-transparent border-none resize-none text-lg text-zinc-300 placeholder:text-zinc-700 focus-visible:ring-0 p-0 leading-relaxed font-sans"
                                     placeholder="Type to offload thoughts..."
                                />
                                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-zinc-600 uppercase tracking-wider">
                                    Saved to local session state
                                </div>
                            </motion.div>
                         )}
                     </AnimatePresence>

                     {/* STATS OVERLAY (Placeholder for now) */}
                     <AnimatePresence>
                         {showStats && (
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute left-0 top-0 bottom-0 w-[300px] bg-zinc-950/95 backdrop-blur-2xl border-r border-white/5 p-8 shadow-2xl z-[60] flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" /> Session Stats
                                    </h3>
                                    <button onClick={() => setShowStats(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                        <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Today's Focus</div>
                                        <div className="text-3xl font-mono text-white">4h 15m</div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                        <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Sessions Completed</div>
                                        <div className="text-3xl font-mono text-white">6</div>
                                    </div>
                                    <div className="text-xs text-zinc-500 italic">
                                        * Stats are reset daily.
                                    </div>
                                </div>
                            </motion.div>
                         )}
                     </AnimatePresence>

                </div>
            )}
        </div>
    );
}
