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
    StickyNote, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type VisualTheme = 'nebula' | 'cyber' | 'zen' | 'void';
type Soundscape = 'rain' | 'binaural' | 'white' | 'none';

export default function FocusPage() {
    const { 
        status, displayTime, initialDuration, activeTaskId,
        startSession, pauseSession, resumeSession, stopSession, sync,
        soundEnabled, setSound: setStoreSound, toggleSound,
        braindump, updateBraindump
    } = useFocusStore();
    
    const { tasks, fetchTasks } = useTaskStore();
    
    // Local State
    const [selectedTask, setSelectedTask] = useState<string>('');
    const [customDuration, setCustomDuration] = useState<number>(25);
    const [intention, setIntention] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showBraindump, setShowBraindump] = useState(false);
    const [theme, setTheme] = useState<VisualTheme>('cyber');
    const [activeSound, setActiveSound] = useState<Soundscape>('none');
    
    // Audio Refs
    const completionAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchTasks();
        // Request Notification Permission
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        // Init Audio (Using a publicly available pleasant chime)
        completionAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Timer Sync & Completion Check
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'running') {
            interval = setInterval(() => {
                const prevTime = useFocusStore.getState().displayTime;
                sync();
                const newTime = useFocusStore.getState().displayTime;
                
                // Check for completion transition
                if (prevTime > 0 && newTime === 0) {
                     handleCompletion();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, sync]);

    const handleCompletion = () => {
        toast.success("Focus Protocol Complete. Neural pathways reinforced.");
        if (completionAudio.current) {
            completionAudio.current.volume = 0.5;
            completionAudio.current.play().catch(e => console.log("Audio allow error", e));
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification("Session Complete", {
                body: "Great work! Take a break.",
                icon: "/icon.png" // Placeholder
            });
        }
    };

    // Format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = initialDuration > 0 ? ((initialDuration * 60 - displayTime) / (initialDuration * 60)) * 100 : 0;
    const gainedXp = Math.floor((initialDuration * 60 - displayTime) / 60 * 15); 
    
    const handleStart = () => {
        startSession(customDuration, selectedTask || null);
        setIsFullscreen(true);
        toast.promise(new Promise(r => setTimeout(r, 1000)), {
            loading: 'Initializing Focus Protocol...',
            success: 'Neural Link Established',
            error: 'Connection Failed'
        });
    };

    const activeTaskData = tasks.find(t => t._id === activeTaskId);

    // --- THEME LOGIC ---
    const themes = {
        cyber: {
            bg: "bg-zinc-950",
            text: "text-emerald-500",
            ring: "ring-emerald-500/20",
            gradient: "from-emerald-500/20 via-transparent to-transparent",
            particle: "bg-emerald-500",
        },
        nebula: {
            bg: "bg-[#0f0c29]", // Deep cosmic purple
            text: "text-purple-300",
            ring: "ring-purple-500/20",
            gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
            particle: "bg-purple-400",
        },
        zen: {
            bg: "bg-stone-900",
            text: "text-amber-100",
            ring: "ring-amber-500/20",
            gradient: "from-amber-500/10 via-transparent to-transparent",
            particle: "bg-amber-100",
        },
        void: {
            bg: "bg-black",
            text: "text-white",
            ring: "ring-white/10",
            gradient: "from-white/5 via-transparent to-transparent",
            particle: "bg-white",
        }
    };

    const currentTheme = themes[theme];

    // --- SOUND LOGIC ---
    const toggleSoundscape = (type: Soundscape) => {
        if(activeSound === type) setActiveSound('none');
        else setActiveSound(type);
    };

    return (
        <div className={cn(
            "flex flex-col items-center min-h-[calc(100vh-4rem)] transition-all duration-1000 ease-in-out font-mono overflow-hidden relative",
            isFullscreen ? `fixed inset-0 z-50 p-0 justify-center ${currentTheme.bg}` : "justify-start py-8 space-y-8 bg-background"
        )}>
            
            {/* GRID BACKGROUND (Cyber Theme) */}
            {theme === 'cyber' && isFullscreen && (
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            )}
            
            {/* SETUP SCREEN */}
            {status === 'idle' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl space-y-8 z-10"
                >
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                            <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            NEURAL INTERFACE
                        </h1>
                        <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
                            Select Protocol Configuration
                        </p>
                    </div>

                    <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        
                        {/* INTENTION INPUT */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <Target className="w-3 h-3" /> Prime Directive
                            </label>
                            <Input 
                                placeholder="What is your focus objective?" 
                                value={intention}
                                onChange={(e) => setIntention(e.target.value)}
                                className="h-14 text-xl bg-black/20 border-zinc-800 text-center font-bold tracking-tight focus-visible:ring-primary/50"
                            />
                        </div>

                        {/* TASK SELECT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Linked Task
                                </label>
                                <Select value={selectedTask} onValueChange={setSelectedTask}>
                                    <SelectTrigger className="h-12 bg-black/20 border-zinc-800">
                                        <SelectValue placeholder="Select active task protocol..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="freestyle">Freestyle (Unbound)</SelectItem>
                                        {tasks.filter(t => t.active).map(task => (
                                            <SelectItem key={task._id} value={task._id}>{task.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                             <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Flame className="w-3 h-3" /> Intensity (Minutes)
                                </label>
                                <div className="flex items-center gap-4">
                                     <Slider 
                                        value={[customDuration]} 
                                        onValueChange={(v) => setCustomDuration(v[0])} 
                                        max={120} min={5} step={5}
                                        className="flex-1"
                                     />
                                     <div className="w-16 h-12 flex items-center justify-center bg-black/40 rounded-lg font-mono text-xl font-bold border border-zinc-800">
                                         {customDuration}
                                     </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.01] transition-transform bg-white text-black hover:bg-zinc-200" 
                            onClick={handleStart}
                        >
                            <Zap className="mr-2 w-5 h-5 fill-black" /> Initialize Sequence
                        </Button>
                    </Card>
                </motion.div>
            )}

            {/* ACTIVE SESSION UI */}
            {status !== 'idle' && (
                <div 
                    className={cn("relative w-full h-full flex flex-col items-center justify-center z-10", currentTheme.text)}
                    onMouseMove={() => { setShowControls(true); }}
                    onClick={() => { setShowControls(!showControls); }}
                >   
                    {/* AMBIENT BACKGROUND GLOW */}
                     <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={cn("absolute inset-0 bg-gradient-to-t opacity-30 pointer-events-none", currentTheme.gradient)} 
                    />

                    {/* TOP HUD (Progress & Task) */}
                    <AnimatePresence>
                    {showControls && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50"
                        >
                            <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] opacity-50">
                                     <Target className="w-3 h-3" /> Current Focus
                                 </div>
                                 <div className="text-2xl md:text-3xl font-black tracking-tight max-w-2xl leading-none">
                                    {intention || activeTaskData?.title || "DEEP WORK PROTOCOL"}
                                 </div>
                                 <div className="flex items-center gap-3 mt-2">
                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                                        <span className="text-xs font-mono font-bold text-white/80">Rate: Optimal</span>
                                    </div>
                                 </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-2">
                                     <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); setShowBraindump(!showBraindump); }}>
                                        <StickyNote className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}>
                                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="hover:bg-red-500/20 text-white/50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); stopSession(); }}>
                                        <Square className="w-5 h-5 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {/* MAIN TIMER DISPLAY */}
                    <div className="relative z-10 flex flex-col items-center gap-8 scale-110 md:scale-150">
                         {/* TIMER CIRCLE/GLOW */}
                         <div className={cn("relative flex items-center justify-center w-[400px] h-[400px] rounded-full ring-1 ring-inset transition-all duration-1000", currentTheme.ring)}>
                             
                             {/* Orbiting Particles (Mock) */}
                             <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full"
                             >
                                 <div className={cn("absolute top-0 left-1/2 w-2 h-2 rounded-full shadow-[0_0_20px_white]", currentTheme.particle)} />
                             </motion.div>

                             {/* TIME TEXT */}
                             <div className="flex flex-col items-center justify-center z-20">
                                 <span className={cn("text-[8rem] leading-none font-black tracking-tighter tabular-nums drop-shadow-2xl", status === 'paused' && "opacity-50 blur-sm")}>
                                     {formatTime(displayTime)}
                                 </span>
                                 {status === 'paused' && (
                                     <span className="absolute text-xl font-bold uppercase tracking-[1rem] animate-pulse text-white">
                                         Paused
                                     </span>
                                 )}
                             </div>
                         </div>

                         {/* CONTROLS (Floating) */}
                         <AnimatePresence>
                         {showControls && (
                             <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex items-center gap-6"
                             >
                                 {/* Sound Controls (Placeholder) */}
                                 <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                     <Volume2 className="w-4 h-4 text-white/50" />
                                     <button onClick={() => toggleSoundscape('rain')} className={cn("p-2 rounded-full transition-all", activeSound === 'rain' ? "bg-white text-black" : "text-white/50 hover:text-white")}>
                                         <CloudRain className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => toggleSoundscape('binaural')} className={cn("p-2 rounded-full transition-all", activeSound === 'binaural' ? "bg-white text-black" : "text-white/50 hover:text-white")}>
                                         <Waves className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => toggleSoundscape('white')} className={cn("p-2 rounded-full transition-all", activeSound === 'white' ? "bg-white text-black" : "text-white/50 hover:text-white")}>
                                         <Wind className="w-4 h-4" />
                                     </button>
                                 </div>

                                 {/* Play Button */}
                                 <Button 
                                    size="icon" 
                                    className={cn("h-20 w-20 rounded-full shadow-2xl hover:scale-105 transition-all text-black bg-white hover:bg-zinc-200")}
                                    onClick={(e) => { e.stopPropagation(); status === 'paused' ? resumeSession() : pauseSession(); }}
                                 >
                                     {status === 'paused' ? <Play className="w-8 h-8 ml-1 fill-black" /> : <Pause className="w-8 h-8 fill-black" />}
                                 </Button>
                                 
                                 {/* Theme Switcher */}
                                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                     {Object.keys(themes).map((t) => (
                                         <button 
                                            key={t}
                                            onClick={(e) => { e.stopPropagation(); setTheme(t as VisualTheme); }}
                                            className={cn(
                                                "w-4 h-4 rounded-full transition-all ring-2 ring-offset-2 ring-offset-black",
                                                theme === t ? "ring-white scale-125" : "ring-transparent hover:scale-110",
                                                themes[t as VisualTheme].particle
                                            )}
                                         />
                                     ))}
                                 </div>
                             </motion.div>
                         )}
                         </AnimatePresence>
                    </div>

                    {/* PROGRESS LINE */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <motion.div 
                            className={cn("h-full", currentTheme.particle)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </div>
                    
                    {/* BRAINDUMP DRAWER */}
                    <AnimatePresence>
                    {showBraindump && (
                         <motion.div 
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            className="absolute right-0 top-0 bottom-0 w-96 bg-zinc-900/90 backdrop-blur-3xl border-l border-white/10 p-6 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> Mental Buffer
                                </h3>
                                <Button size="icon" variant="ghost" onClick={() => setShowBraindump(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <Textarea 
                                className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 text-lg leading-relaxed placeholder:text-zinc-600"
                                placeholder="Offload distracting thoughts here..."
                                value={braindump}
                                onChange={(e) => updateBraindump(e.target.value)}
                                autoFocus
                            />
                            <div className="text-xs text-zinc-600 mt-4">
                                Content persists until session end.
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                </div>
            )}
        </div>
    );
}
