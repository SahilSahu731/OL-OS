'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { Layers, Play, Clock, Plus, GripVertical, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface RoutineStep {
    id: string;
    title: string;
    duration: number; // minutes
}

interface Routine {
    id: string;
    title: string;
    icon: string;
    color: string;
    description: string;
    steps: RoutineStep[];
}

// Dummy Data
const DEFAULT_ROUTINES: Routine[] = [
    {
        id: '1',
        title: 'Morning Launchpad',
        icon: '☀️',
        color: 'bg-orange-500',
        description: 'High energy start to the day. Focus on hydration and movement.',
        steps: [
            { id: 'm1', title: 'Drink 500ml Water', duration: 1 },
            { id: 'm2', title: 'Stretch / Yoga', duration: 10 },
            { id: 'm3', title: 'Cold Shower', duration: 5 },
            { id: 'm4', title: 'Review Daily Goals', duration: 5 }
        ]
    },
    {
        id: '2',
        title: 'Deep Work Entry',
        icon: '🧠',
        color: 'bg-indigo-500',
        description: 'Transition ritual to enter flow state.',
        steps: [
            { id: 'd1', title: 'Clear Desk', duration: 2 },
            { id: 'd2', title: 'Put Phone Away', duration: 1 },
            { id: 'd3', title: 'Set Focus Music', duration: 1 },
            { id: 'd4', title: 'Define ONE Goal', duration: 2 }
        ]
    },
    {
        id: '3',
        title: 'Evening Shutdown',
        icon: '🌙',
        color: 'bg-slate-700',
        description: 'Detach from work and prepare for sleep.',
        steps: [
            { id: 'e1', title: 'Close open tabs', duration: 2 },
            { id: 'e2', title: 'Review tomorrow', duration: 5 },
            { id: 'e3', title: 'Tidy workspace', duration: 5 },
            { id: 'e4', title: 'Read fiction', duration: 20 }
        ]
    },
    {
        id: '4',
        title: 'Weekly Review',
        icon: '📅',
        color: 'bg-rose-500',
        description: 'Reflect on the past week and plan the next.',
        steps: [
            { id: 'w1', title: 'Review Calendar', duration: 5 },
            { id: 'w2', title: 'Check Finance', duration: 10 },
            { id: 'w3', title: 'Plan Next Week', duration: 15 },
            { id: 'w4', title: 'Journal Reflections', duration: 10 }
        ]
    },
    {
        id: '5',
        title: 'Fitness Protocol',
        icon: '💪',
        color: 'bg-emerald-600',
        description: 'Pre-workout activation sequence.',
        steps: [
            { id: 'f1', title: 'Put on Gear', duration: 5 },
            { id: 'f2', title: 'Pre-workout Meal', duration: 10 },
            { id: 'f3', title: 'Fill Water Bottle', duration: 2 },
            { id: 'f4', title: 'Dynamic Stretching', duration: 5 }
        ]
    }
];

// Templates Data
const TEMPLATES: Routine[] = [
    {
        id: 't1',
        title: 'Huberman Morning',
        icon: '🧬',
        color: 'bg-sky-500',
        description: 'Neuroscience-based protocol for alertness and sleep health.',
        steps: [
            { id: 'h1', title: 'View Morning Sunlight', duration: 10 },
            { id: 'h2', title: 'Hydrate + Salt', duration: 2 },
            { id: 'h3', title: 'Delay Caffeine (90m)', duration: 0 },
            { id: 'h4', title: 'Cold Exposure', duration: 3 }
        ]
    },
    {
        id: 't2',
        title: 'Deep Work (Newport)',
        icon: '📚',
        color: 'bg-amber-600',
        description: 'Maximize cognitive throughput and minimize distraction.',
        steps: [
            { id: 'dp1', title: 'Ritualize Start', duration: 5 },
            { id: 'dp2', title: 'Block Distractions', duration: 2 },
            { id: 'dp3', title: 'Define Success Criteria', duration: 3 },
            { id: 'dp4', title: 'Execute Core Task', duration: 90 }
        ]
    },
    {
        id: 't3',
        title: 'Ferriss Slow-Carb',
        icon: '🍳',
        color: 'bg-emerald-500',
        description: 'The precise breakfast protocol for the 4-Hour Body.',
        steps: [
            { id: 'tf1', title: '30g Protein w/in 30m', duration: 10 },
            { id: 'tf2', title: 'Ice Cold Water', duration: 1 },
            { id: 'tf3', title: 'Supplements (PAGG)', duration: 1 },
            { id: 'tf4', title: 'Air Squats (Activation)', duration: 2 }
        ]
    },
    {
        id: 't4',
        title: 'Monk Mode Evening',
        icon: '🧘',
        color: 'bg-violet-900',
        description: 'Detachment from the digital world for superior sleep.',
        steps: [
            { id: 'mm1', title: 'Screens Off (Blue Block)', duration: 1 },
            { id: 'mm2', title: 'Plan Tomorrow', duration: 10 },
            { id: 'mm3', title: 'Meditation', duration: 20 },
            { id: 'mm4', title: 'Reading (Physical Book)', duration: 30 }
        ]
    }
];

export default function RoutineStacksPage() {
    const [activeTab, setActiveTab] = useState<'my_routines' | 'explore'>('my_routines');
    const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
    const [playerMode, setPlayerMode] = useState(false);
    
    // Player State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false); // Timer paused by default
    const [sound, setSound] = useState<'none' | 'rain' | 'white_noise'>('none');
    
    // Advanced Features
    const [enableVoice, setEnableVoice] = useState(false);
    const [zenMode, setZenMode] = useState(false);

    // New Routine Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRoutine, setNewRoutine] = useState<{title: string, icon: string, color: string, description: string, steps: RoutineStep[]}>({
        title: '',
        icon: '✨',
        color: 'bg-blue-500',
        description: '',
        steps: [{ id: '1', title: 'First Step', duration: 5 }]
    });

    // --- TEMPLATE LOGIC ---
    const importTemplate = (template: Routine) => {
        const importedRoutine = {
            ...template,
            id: Math.random().toString(), // New ID
            title: `${template.title} (Copy)`
        };
        setRoutines([...routines, importedRoutine]);
        setActiveTab('my_routines');
    };

    // --- PLAYER LOGIC ---
    const startRoutine = (routine: Routine) => {
        setActiveRoutine(routine);
        setPlayerMode(true);
        setCurrentStepIndex(0);
        setTimeLeft(routine.steps[0].duration * 60);
        setIsPlaying(false); // Don't auto-start timer
        speak(routine.steps[0].title);
    };

    // Voice Assistant
    const speak = (text: string) => {
        if (enableVoice && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Timer Tick
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (playerMode && isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isPlaying) {
           setIsPlaying(false);
           if(enableVoice) speak("Time is up.");
        }
        return () => clearInterval(interval);
    }, [playerMode, isPlaying, timeLeft, enableVoice]);

    const nextStep = () => {
        if (!activeRoutine) return;
        if (currentStepIndex < activeRoutine.steps.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            setTimeLeft(activeRoutine.steps[nextIdx].duration * 60);
            setIsPlaying(false); // Don't auto-start
            speak(activeRoutine.steps[nextIdx].title);
        } else {
            completeRoutine();
        }
    };

    const prevStep = () => {
        if (!activeRoutine || currentStepIndex === 0) return;
        const prevIdx = currentStepIndex - 1;
        setCurrentStepIndex(prevIdx);
        setTimeLeft(activeRoutine.steps[prevIdx].duration * 60);
        setIsPlaying(false);
    };

    const completeRoutine = () => {
        if(enableVoice) speak("Routine complete. Great job.");
        setPlayerMode(false);
        setActiveRoutine(null);
        setIsPlaying(false);
        // In a real app, save completion to DB here
    };

    const toggleTimer = () => setIsPlaying(!isPlaying);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- BUILDER LOGIC ---
    const addStepToBuilder = () => {
        setNewRoutine(prev => ({
            ...prev,
            steps: [...prev.steps, { id: Math.random().toString(), title: '', duration: 5 }]
        }));
    };

    const updateStep = (index: number, field: keyof RoutineStep, value: any) => {
        const newSteps = [...newRoutine.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setNewRoutine(prev => ({ ...prev, steps: newSteps }));
    };

    const removeStep = (index: number) => {
        setNewRoutine(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    const saveNewRoutine = () => {
        if(!newRoutine.title) return;
        const routine: Routine = {
            id: Math.random().toString(),
            ...newRoutine
        };
        setRoutines([...routines, routine]);
        setIsCreateOpen(false);
        // Reset form
        setNewRoutine({ title: '', icon: '✨', color: 'bg-blue-500', description: '', steps: [{ id: '1', title: 'First Step', duration: 5 }] });
    };

    return (
        <div className="space-y-6 min-h-screen">
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">Routine Stacks</h1>
                     <p className="text-muted-foreground">Chain habits together for frictionless execution.</p>
                </div>
                
                <div className="flex gap-4">
                     <div className="bg-secondary/50 p-1 rounded-lg flex items-center gap-1">
                        <Button 
                            variant={activeTab === 'my_routines' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setActiveTab('my_routines')}
                            className="bg-background shadow-none text-foreground data-[state=active]:bg-background"
                        >
                            My Stacks
                        </Button>
                        <Button 
                            variant={activeTab === 'explore' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setActiveTab('explore')}
                        >
                            Explore Templates
                        </Button>
                     </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Create Custom</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>New Routine Stack</DialogTitle>
                                <DialogDescription>Design your perfect flow.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3 space-y-2">
                                        <label className="text-sm font-medium">Routine Name</label>
                                        <Input placeholder="e.g. Sunday Reset" value={newRoutine.title} onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Icon</label>
                                        <Input className="text-center text-2xl" maxLength={2} value={newRoutine.icon} onChange={e => setNewRoutine({...newRoutine, icon: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input placeholder="Briefly describe the outcome..." value={newRoutine.description} onChange={e => setNewRoutine({...newRoutine, description: e.target.value})} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Steps Sequence</label>
                                        <Button variant="ghost" size="sm" onClick={addStepToBuilder}><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
                                    </div>
                                    <div className="space-y-2 border rounded-lg p-2 bg-secondary/10">
                                        {newRoutine.steps.map((step, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center rounded-full p-0 shrink-0">{index + 1}</Badge>
                                                <Input 
                                                    className="flex-1 h-8" 
                                                    placeholder="Step Title" 
                                                    value={step.title} 
                                                    onChange={e => updateStep(index, 'title', e.target.value)} 
                                                />
                                                <div className="flex items-center gap-1 w-24">
                                                    <Input 
                                                        type="number" 
                                                        className="h-8" 
                                                        value={step.duration} 
                                                        onChange={e => updateStep(index, 'duration', parseInt(e.target.value) || 0)} 
                                                    />
                                                    <span className="text-xs text-muted-foreground">min</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeStep(index)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={saveNewRoutine}>Save Routine</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <HabitNav />

            {/* ROUTINE CARDS GRID - MY ROUTINES */}
            {activeTab === 'my_routines' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {routines.map((routine) => (
                        <Card key={routine.id} className="relative overflow-hidden group hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: routine.color.replace('bg-', '') }}>
                            {/* Background Decoration */}
                            <div className={cn("absolute right-0 top-0 w-32 h-32 opacity-10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110", routine.color)} />
                            
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="text-4xl mb-2">{routine.icon}</div>
                                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 shadow-sm" onClick={() => startRoutine(routine)}>
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </div>
                                <CardTitle>{routine.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{routine.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {routine.steps.slice(0, 3).map((step, i) => (
                                        <div key={step.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0">
                                                {i + 1}
                                            </div>
                                            <span className="truncate flex-1">{step.title}</span>
                                            <span className="text-xs opacity-50 whitespace-nowrap">{step.duration}m</span>
                                        </div>
                                    ))}
                                    {routine.steps.length > 3 && (
                                        <div className="text-xs text-center text-muted-foreground pt-1">
                                            + {routine.steps.length - 3} more steps
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routine.steps.reduce((acc, s) => acc + s.duration, 0)} min total</span>
                                    <span>{routine.steps.length} steps</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* TEMPLATE GALLERY */}
             {activeTab === 'explore' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-8 duration-500">
                    {TEMPLATES.map((routine) => (
                        <Card key={routine.id} className="relative overflow-hidden group hover:shadow-lg transition-all border-dashed border-2">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-500">{routine.icon}</div>
                                    <Button size="sm" variant="outline" className="gap-2" onClick={() => importTemplate(routine)}>
                                        <Plus className="w-4 h-4" /> Add
                                    </Button>
                                </div>
                                <CardTitle className="text-muted-foreground group-hover:text-foreground transition-colors">{routine.title}</CardTitle>
                                <CardDescription>{routine.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {routine.steps.map((step, i) => (
                                        <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                            <span className="truncate flex-1">{step.title}</span>
                                            <span className="opacity-50">{step.duration}m</span>
                                        </div>
                                    ))}
                                </div>
                                 <div className="mt-4 pt-4 border-t text-xs text-center text-muted-foreground">
                                     Creator Protocol
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* FULL SCREEN PLAYER MODAL (ADVANCED) */}
            <AnimatePresence>
                {playerMode && activeRoutine && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 bg-background flex flex-col"
                    >
                        {/* Header */}
                        <div className={cn("p-6 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-10 transition-opacity", zenMode ? "opacity-0 hover:opacity-100" : "bg-background/80 opacity-100")}>
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <span className="text-2xl">{activeRoutine.icon}</span> {activeRoutine.title}
                                </h2>
                                <p className="text-muted-foreground text-sm">Step {currentStepIndex + 1} of {activeRoutine.steps.length}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Advanced Toggles */}
                                <Button variant={zenMode ? "default" : "ghost"} size="sm" onClick={() => setZenMode(!zenMode)} title="Toggle Zen Mode">
                                    Zen
                                </Button>
                                <Button variant={enableVoice ? "default" : "ghost"} size="icon" onClick={() => setEnableVoice(!enableVoice)} title="Toggle Voice Guide">
                                    {enableVoice ? <span className="text-xs">🔊</span> : <span className="text-xs text-muted-foreground">🔇</span>}
                                </Button>
 
                                <div className="w-px h-6 bg-border mx-1" />

                                {/* Soundscape Selector */}
                                <Select value={sound} onValueChange={(v: any) => setSound(v)}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue placeholder="Ambience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Create Silence</SelectItem>
                                        <SelectItem value="rain">Heavy Rain</SelectItem>
                                        <SelectItem value="white_noise">White Noise</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <Button variant="ghost" size="icon" onClick={() => setPlayerMode(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 max-w-2xl mx-auto w-full relative">
                             {/* Timer Circle Effect - Only visible when playing */}
                             {isPlaying && (
                                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                                    <div className={cn("w-[600px] h-[600px] rounded-full animate-pulse", activeRoutine.color)} />
                                 </div>
                             )}

                            {/* Visual Progress */}
                            <div className={cn("w-full h-2 bg-secondary rounded-full overflow-hidden transition-opacity duration-500", zenMode ? "opacity-0" : "opacity-100")}>
                                <motion.div 
                                    className={cn("h-full", activeRoutine.color)} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStepIndex) / activeRoutine.steps.length) * 100}%` }}
                                />
                            </div>

                            {/* Current Task */}
                            <AnimatePresence mode='wait'>
                                <motion.div 
                                    key={currentStepIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="space-y-8 relative z-10"
                                >
                                    {!zenMode && (
                                        <Badge variant="outline" className="px-4 py-1 text-lg mb-4 mx-auto w-fit uppercase tracking-widest bg-background">
                                            Current Focus
                                        </Badge>
                                    )}
                                    <h1 className={cn("font-black tracking-tight leading-tight transition-all duration-500", zenMode ? "text-7xl md:text-9xl" : "text-5xl md:text-7xl")}>
                                        {activeRoutine.steps[currentStepIndex].title}
                                    </h1>
                                    
                                    <div 
                                        className={cn("font-mono font-light tabular-nums cursor-pointer hover:opacity-80 transition-all duration-500", zenMode ? "text-4xl text-muted-foreground/50" : "text-6xl")}
                                        onClick={toggleTimer}
                                        title={isPlaying ? "Pause Timer" : "Start Timer"}
                                    >
                                        {formatTime(timeLeft)}
                                    </div>
                                    
                                    {!zenMode && (
                                        <div className="flex justify-center gap-4">
                                            <Button size="lg" variant={isPlaying ? "secondary" : "default"} className="rounded-full w-16 h-16 p-0 shadow-lg" onClick={toggleTimer}>
                                                {isPlaying ? <span className="text-2xl">⏸</span> : <span className="text-2xl pl-1">▶</span>}
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        <div className={cn("p-8 border-t bg-secondary/10 transition-opacity duration-500", zenMode ? "opacity-0 hover:opacity-100" : "opacity-100")}>
                            <div className="max-w-2xl mx-auto flex items-center justify-between">
                                <Button variant="outline" size="lg" className="px-8" onClick={prevStep} disabled={currentStepIndex === 0}>
                                    Previous
                                </Button>
                                
                                <Button size="lg" className={cn("px-12 h-14 text-lg shadow-xl hover:scale-105 transition-transform", activeRoutine.color)} onClick={nextStep}>
                                    {currentStepIndex === activeRoutine.steps.length - 1 ? (
                                        <>Complete Routine <CheckCircle2 className="w-5 h-5 ml-2" /></>
                                    ) : (
                                        <>Next Step <ChevronRight className="w-5 h-5 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
