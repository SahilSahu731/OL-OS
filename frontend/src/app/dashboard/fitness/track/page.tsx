'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWorkoutStore, Routine, ExerciseSet } from '@/stores/workoutStore';
import { FitnessNav } from '@/components/FitnessNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Play, Pause, ChevronLeft, ChevronRight, 
    Timer, CheckCircle2, Plus, 
    Clock, Zap, ArrowRight, Maximize2, Minimize2, ArrowUp, ArrowDown, Mic,
    Wind, Activity, RefreshCcw, Info, SkipForward
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

// --- CONSTANTS ---
const CALISTHENICS_PROGRESSIONS: Record<string, string[]> = {
    'Plank': ['Knee Plank', 'Standard Plank', 'Side Plank', 'Weighted Plank'],
    'Pushup': ['Wall Pushup', 'Incline Pushup', 'Knee Pushup', 'Standard Pushup', 'Diamond Pushup', 'Archer Pushup', 'One Arm Pushup'],
    'Pullup': ['Dead Hang', 'Scapular Pulls', 'Band Assist Pullup', 'Negative Pullup', 'Chinup', 'Pullup', 'Weighted Pullup'],
    'Squat': ['Box Squat', 'Air Squat', 'Split Squat', 'Bulgarian Split Squat', 'Pistol Squat'],
    'L-Sit': ['Tuck Support', 'Tuck L-Sit', 'One Leg L-Sit', 'Straddle L-Sit', 'Full L-Sit', 'V-Sit', 'Manna'],
    'Handstand': ['Wall Hold (Belly)', 'Wall Hold (Back)', 'Kick Ups', 'Freestanding Hold', 'Handstand Pushup'],
    'Front Lever': ['Tuck Lever', 'Adv Tuck Lever', 'Straddle Lever', 'Full Front Lever'],
    'Planche': ['Tuck Planche', 'Adv Tuck Planche', 'Straddle Planche', 'Full Planche']
};

export default function TrackSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get('routine');
  
  const { routines, createWorkout, fetchRoutines } = useWorkoutStore();
  
  // Session State
  const [activeRoutine, setActiveRoutine] = useState<Partial<Routine> | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0); // seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Exercise Navigation
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Set Interaction State
  const [activeSetId, setActiveSetId] = useState<string | null>(null); // To track which set is being timed
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Exercise Mode (Reps vs Time)
  const [inputMode, setInputMode] = useState<'reps' | 'time'>('reps');

  // Rest Timer
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  
  // Smart Coach State
  const [coachSuggestion, setCoachSuggestion] = useState<{ type: 'upgrade' | 'downgrade', message: string } | null>(null);

  // Load data on mount
  useEffect(() => {
      fetchRoutines();
      if (typeof window !== 'undefined') {
          speechRef.current = new SpeechSynthesisUtterance();
      }
  }, [fetchRoutines]);

  // Load Routine from URL if present and routines loaded
  useEffect(() => {
      if (routineId && routines.length > 0 && !activeRoutine) {
          const found = routines.find(r => r._id === routineId);
          if (found) {
              startRoutine(found);
          }
      }
  }, [routineId, routines, activeRoutine]);


  // Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRoutine && !isPaused && !isFinished) {
        interval = setInterval(() => {
            setSessionDuration(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRoutine, isPaused, isFinished]);

  // Rest Timer Logic & Auto-Advance
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isResting && restTimer > 0) {
          interval = setInterval(() => {
              setRestTimer(prev => {
                  if (prev === 4) speak("Get Ready"); // Audio cue
                  if (prev <= 1) {
                      setIsResting(false);
                      speak("Go");
                      checkAutoAdvance();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval!);
  }, [isResting, restTimer, exercises, currentExerciseIndex]);

  // Detect Input Mode based on keywords
  useEffect(() => {
      const currentName = exercises[currentExerciseIndex]?.name || '';
      if (currentName.includes('Hold') || currentName.includes('Plank') || currentName.includes('L-Sit') || currentName.includes('Stand') || currentName.includes('Lever')) {
          setInputMode('time');
      } else {
          setInputMode('reps');
      }
  }, [currentExerciseIndex, exercises]);

  // STOPWATCH LOGIC (Audio Pacer)
  useEffect(() => {
      if (activeSetId && stopwatchTime > 0) {
           if (stopwatchTime % 10 === 0) {
               speak(`${stopwatchTime} seconds`);
           }
      }
  }, [stopwatchTime, activeSetId]);

  // SMART COACH LOGIC
  useEffect(() => {
      const currentEx = exercises[currentExerciseIndex];
      // Check last 2 completed sets
      const completedSets = currentEx?.sets.filter((s:any) => s.completed) || [];
      if (completedSets.length >= 2) {
          const lastTwo = completedSets.slice(-2);
          if (lastTwo.every((s:any) => s.grade === 'A')) {
               setCoachSuggestion({ type: 'upgrade', message: 'Perfect Form Detected. Ready to Level Up?' });
          } else if (lastTwo.every((s:any) => s.grade === 'C')) {
               setCoachSuggestion({ type: 'downgrade', message: 'Form breakdown. Regress to maintain quality?' });
          } else {
               setCoachSuggestion(null);
          }
      } else {
          setCoachSuggestion(null);
      }
  }, [exercises, currentExerciseIndex]);

  const speak = (text: string) => {
      if (speechRef.current) {
          speechRef.current.text = text;
          window.speechSynthesis.speak(speechRef.current);
      }
  };

  const startStopwatch = (idx: number, setIndex: number) => {
      if (activeSetId === `${idx}-${setIndex}`) {
          // STOP
          clearInterval(stopwatchIntervalRef.current!);
          handleUpdateSet(idx, setIndex, 'duration', stopwatchTime); 
          // Fill Input visually
          if (inputMode === 'time') {
             handleUpdateSet(idx, setIndex, 'reps', stopwatchTime); 
          }
          setActiveSetId(null);
          setStopwatchTime(0);
      } else {
          // START
          setActiveSetId(`${idx}-${setIndex}`);
          setStopwatchTime(0);
          stopwatchIntervalRef.current = setInterval(() => {
              setStopwatchTime(prev => prev + 1);
          }, 1000);
      }
  };

  const startRoutine = (routine: Routine) => {
      setActiveRoutine(routine);
      setExercises(JSON.parse(JSON.stringify(routine.exercises)).map((ex: any) => ({
          ...ex,
          sets: ex.sets.map((s: any) => ({ ...s, completed: false, weight: s.weight || 0, reps: s.reps || 0, grade: null }))
      })));
      setSessionStartTime(new Date());
      setSessionDuration(0);
      setIsPaused(false);
      setIsFinished(false);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set('routine', routine._id);
      window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const startFreestyle = () => {
    setActiveRoutine({ name: 'Freestyle Protocol', _id: 'freestyle' });
    setExercises([]);
    setSessionStartTime(new Date());
    setSessionDuration(0);
    setIsPaused(false);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, val: any) => {
      const newEx = [...exercises];
      newEx[exIndex].sets[setIndex][field] = val;
      setExercises(newEx);
  };

  const checkAutoAdvance = () => {
      const currentEx = exercises[currentExerciseIndex];
      const allSetsDone = currentEx.sets.every((s:any) => s.completed);
      
      if (allSetsDone && currentExerciseIndex < exercises.length - 1) {
          toast.success("Moving to next movement...");
          setCurrentExerciseIndex(p => p + 1);
      }
  };

  const completeSetWithGrade = (exIndex: number, setIndex: number, grade: 'A'|'B'|'C') => {
      const newEx = [...exercises];
      newEx[exIndex].sets[setIndex].completed = true;
      newEx[exIndex].sets[setIndex].grade = grade;
      setExercises(newEx);

      setRestTimer(90); // Default rest
      setIsResting(true);
  };
  
  const skipRestAndAdvance = () => {
      setIsResting(false);
      setRestTimer(0);
      checkAutoAdvance();
  };

  const addSet = (exIndex: number) => {
      const newEx = [...exercises];
      const prevSet = newEx[exIndex].sets[newEx[exIndex].sets.length - 1] || { weight: 0, reps: 0 };
      newEx[exIndex].sets.push({ 
          weight: prevSet.weight, 
          reps: prevSet.reps, 
          completed: false,
          grade: null 
      });
      setExercises(newEx);
  };

  const changeProgression = (direction: 'up' | 'down') => {
      const currentName = exercises[currentExerciseIndex].name;
      let foundKey = Object.keys(CALISTHENICS_PROGRESSIONS).find(k => currentName.includes(k) || CALISTHENICS_PROGRESSIONS[k].includes(currentName));
      
      if (foundKey) {
          const list = CALISTHENICS_PROGRESSIONS[foundKey];
          const currentIdx = list.indexOf(currentName);
          
          if (currentIdx === -1) {
              if (direction === 'up' && list.length > 0) updateExerciseName(list[0]);
          } else {
              if (direction === 'up' && currentIdx < list.length - 1) updateExerciseName(list[currentIdx + 1]);
              if (direction === 'down' && currentIdx > 0) updateExerciseName(list[currentIdx - 1]);
          }
      } else {
          toast.error("No progression tree found for this skill.");
      }
      setCoachSuggestion(null);
  };

  const updateExerciseName = (newName: string) => {
      const newEx = [...exercises];
      newEx[currentExerciseIndex].name = newName;
      setExercises(newEx);
      toast.success(`Progression Adjusted: ${newName}`);
  };

  const finishWorkout = async () => {
      setIsFocusMode(false);
      setIsFinished(true);
  };

  const confirmSaveAndExit = async () => {
      if (!exercises.length && activeRoutine?.name !== 'Freestyle Protocol') return;
      
      const workoutData = {
          name: activeRoutine?.name || 'Untitled Session',
          date: new Date().toISOString(),
          duration: Math.floor(sessionDuration / 60),
          exercises: exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets.filter((s: any) => s.completed)
          })),
          notes: "Completed via Metabolic OS Tracker"
      };

      try {
        await createWorkout(workoutData);
        toast.success("Protocol saved successfully.");
        router.push('/dashboard/fitness/manage');
      } catch (err) {
        toast.error("Failed to save protocol.");
      }
  };

  // --- RENDER ---
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = exercises[currentExerciseIndex + 1];
  const progress = exercises.length > 0 ? (exercises.reduce((acc, ex) => acc + ex.sets.filter((s:any) => s.completed).length, 0) / exercises.reduce((acc, ex) => acc + ex.sets.length, 0)) * 100 : 0;
  
  // Ambient State Color
  const ambientColor = isPaused 
      ? "from-amber-500/10 via-black to-black" 
      : isResting 
        ? "from-cyan-900/30 via-black to-blue-950/20" 
        : "from-emerald-900/10 via-black to-black";

  // View: Selection
  if (!activeRoutine) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaysRoutines = routines.filter(r => r.days && r.days.includes(today));
      const otherRoutines = routines.filter(r => !r.days || !r.days.includes(today));

      return (
          <div className="flex flex-col h-[calc(100vh-2rem)] gap-8 pb-6 relative animate-in fade-in duration-500">
              <FitnessNav />
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-12 pb-20">
                  <div className="space-y-2">
                       <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Protocol Selection</h1>
                       <p className="text-zinc-400 font-mono text-sm uppercase tracking-wider">Select payload for {format(new Date(), 'EEEE, MMMM do')}</p>
                  </div>
                  <section className="space-y-6">
                      <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-zinc-800"></div>
                          <span className="text-sm font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2"><Zap className="w-4 h-4" /> Recommended Today</span>
                          <div className="h-px flex-1 bg-zinc-800"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {todaysRoutines.map(routine => (
                              <motion.div key={routine._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => startRoutine(routine)} className="group cursor-pointer relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-zinc-800 p-8 shadow-2xl transition-all hover:border-emerald-500/50">
                                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                                  <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                                      <div className="space-y-4">
                                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest hover:bg-emerald-500/20">Priority</Badge>
                                          <h3 className="text-3xl font-black uppercase italic text-white tracking-tight group-hover:text-emerald-400 transition-colors">{routine.name}</h3>
                                          <p className="text-zinc-500 text-sm font-medium line-clamp-2">{routine.notes || "Standard execution protocol."}</p>
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </section>
                  <section className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div onClick={startFreestyle} className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-zinc-900 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110"><Plus className="w-6 h-6 text-zinc-400"/></div>
                                <h3 className="font-bold text-zinc-300">Freestyle Session</h3>
                            </div>
                            {otherRoutines.map(routine => (
                                <div key={routine._id} onClick={() => startRoutine(routine)} className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-700 transition-all flex flex-col justify-between h-[160px] group">
                                    <h3 className="font-bold text-zinc-300 group-hover:text-white transition-colors">{routine.name}</h3>
                                </div>
                            ))}
                       </div>
                  </section>
              </div>
          </div>
      )
  }

  // View: Active Session
  return (
    <div className={cn("flex flex-col h-[calc(100vh-2rem)] animate-in fade-in duration-500 gap-6 pb-6 relative overflow-hidden transition-colors duration-1000 bg-gradient-to-b", ambientColor, isFocusMode ? "h-screen fixed inset-0 z-50 p-4 md:p-8" : "")}>
      {!isFocusMode && <FitnessNav />}

      {/* FINISH OVERLAY */}
      <AnimatePresence>
        {isFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"/>
                <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="relative bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-10 text-center overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Mission Accomplished</h2>
                        <p className="text-zinc-400 text-lg uppercase tracking-widest font-bold">Protocol Executed Successfully</p>
                    </div>
                    <Button onClick={confirmSaveAndExit} size="lg" className="w-full h-16 text-xl font-black uppercase rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg">Save to Database</Button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden relative z-10">
        <div className="flex-[2] flex flex-col gap-4 overflow-hidden h-full">
           {/* HUD */}
           <div className={cn("flex justify-between items-center bg-zinc-950/80 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 shadow-xl relative overflow-hidden transition-all", isFocusMode ? "bg-black border-zinc-900" : "")}>
               <div className="relative z-10 flex flex-col">
                   <div className="flex items-center gap-3 mb-1">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isPaused ? "bg-amber-500" : "bg-emerald-500")} />
                        <span className={cn("text-xs font-black uppercase tracking-widest", isPaused ? "text-amber-500" : "text-emerald-500")}>{isPaused ? "System Paused" : "System Active"}</span>
                   </div>
                   <h1 className="text-2xl font-black uppercase tracking-tight text-white/80 truncate max-w-[300px]">{activeRoutine.name}</h1>
               </div>
               
               {/* SEGMENTED PROGRESS (Visual) */}
               <div className="hidden md:flex gap-1 h-2 flex-1 mx-8 max-w-[200px]">
                   {exercises.map((_, idx) => (
                       <div key={idx} className={cn("flex-1 rounded-full text-[0px]", idx < currentExerciseIndex ? "bg-emerald-500" : idx === currentExerciseIndex ? "bg-white animate-pulse" : "bg-zinc-800")}>.</div>
                   ))}
               </div>

               <div className="relative z-10 flex items-center gap-6">
                   <div className="text-6xl font-black font-mono tabular-nums tracking-tighter text-white">{formatTime(sessionDuration)}</div>
                   <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white" onClick={() => setIsFocusMode(!isFocusMode)}>{isFocusMode ? <Minimize2 className="w-6 h-6"/> : <Maximize2 className="w-6 h-6"/>}</Button>
               </div>
           </div>

           {/* MAIN CARD */}
           <div className={cn("flex-1 relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl flex flex-col transition-all", isFocusMode ? "border-zinc-900" : "")}>
               <div className="p-8 pb-4 border-b border-zinc-900 flex justify-between items-start z-20">
                   <div>
                       <div className="flex items-center gap-3 mb-2">
                           <span className="bg-zinc-900 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-zinc-800">Movement {currentExerciseIndex + 1} / {exercises.length}</span>
                           <Button variant="outline" size="sm" className="h-6 text-[10px] uppercase font-bold border-zinc-800 hover:bg-zinc-900" onClick={() => setInputMode(inputMode === 'reps' ? 'time' : 'reps')}>Mode: {inputMode === 'reps' ? 'Repetitions' : 'Duration'}</Button>
                       </div>
                       
                       <div className="flex items-center gap-4">
                           <h2 className={cn("font-black italic uppercase tracking-tighter text-white break-words leading-[0.9]", isFocusMode ? "text-6xl md:text-8xl" : "text-5xl md:text-6xl")}>{currentExercise?.name}</h2>
                           
                           {/* VARIANT CONTROLS */}
                           <div className="flex flex-col gap-1">
                               <Button variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-zinc-800 rounded-lg", coachSuggestion?.type === 'upgrade' ? "text-emerald-500 animate-bounce" : "text-zinc-500")} onClick={() => changeProgression('up')}><ArrowUp className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-zinc-800 rounded-lg", coachSuggestion?.type === 'downgrade' ? "text-amber-500 animate-bounce" : "text-zinc-500")} onClick={() => changeProgression('down')}><ArrowDown className="w-4 h-4"/></Button>
                           </div>
                       </div>
                       
                       {/* NOTES / CUES */}
                       <div className="mt-3 flex items-start gap-2 max-w-xl opacity-75">
                           <Info className="w-4 h-4 text-zinc-500 mt-0.5" />
                           <p className="text-zinc-400 text-sm italic">{currentExercise?.notes || "Maintain core tension. Quality over quantity."}</p>
                       </div>

                       {coachSuggestion && (
                           <div className={cn("text-xs font-bold uppercase tracking-widest mt-2", coachSuggestion.type === 'upgrade' ? "text-emerald-500" : "text-amber-500")}>
                               Coach: {coachSuggestion.message}
                           </div>
                       )}
                   </div>
                   <div className="flex gap-2">
                       <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-zinc-800 bg-zinc-900 hover:scale-105 transition-transform" disabled={currentExerciseIndex === 0} onClick={() => setCurrentExerciseIndex(prev => prev - 1)}><ChevronLeft className="w-6 h-6" /></Button>
                       <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-zinc-800 bg-zinc-900 hover:scale-105 transition-transform" disabled={currentExerciseIndex === exercises.length - 1} onClick={() => setCurrentExerciseIndex(prev => prev + 1)}><ChevronRight className="w-6 h-6" /></Button>
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative">
                   <table className="w-full text-left border-collapse">
                       <thead className="bg-zinc-900/50 text-[10px] font-bold uppercase tracking-widest text-zinc-500 sticky top-0 backdrop-blur-md z-10">
                           <tr>
                               <th className="p-4 pl-8 text-center w-16">Set</th>
                               <th className="p-4 text-center">Intensity (lbs/add)</th>
                               <th className="p-4 text-center">{inputMode === 'time' ? 'Hold Time' : 'Reps'}</th>
                               <th className="p-4 text-center w-48">Validation</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-900">
                           {currentExercise?.sets.map((set: any, idx: number) => {
                               const isActiveTimer = activeSetId === `${currentExerciseIndex}-${idx}`;
                               return (
                               <tr key={idx} className={cn("group transition-colors", set.completed ? "bg-emerald-950/20" : "hover:bg-zinc-900/30")}>
                                   <td className="p-4 pl-8 text-center">
                                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black mx-auto shadow-lg", set.completed ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-zinc-900 text-zinc-500")}>{idx + 1}</div>
                                   </td>
                                   <td className="p-4"><Input type="number" className={cn("h-16 text-center text-3xl font-black bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all", set.completed ? "text-emerald-500 border-emerald-500/30" : "text-white")} value={set.weight || ''} placeholder="0" onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'weight', parseFloat(e.target.value))} /></td>
                                   <td className="p-4">
                                       {inputMode === 'time' ? (
                                           <div className="h-16 flex items-center justify-center relative">
                                               {isActiveTimer ? (
                                                   <Button className="w-full h-full relative overflow-hidden border-2 border-emerald-500 text-3xl font-mono font-black text-emerald-500 hover:bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] duration-700" onClick={() => startStopwatch(currentExerciseIndex, idx)}>
                                                       <motion.div 
                                                          className="absolute inset-0 bg-emerald-500/20"
                                                          initial={{ height: '0%' }}
                                                          animate={{ height: '100%' }}
                                                          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                                       />
                                                       <span className="relative z-10">{stopwatchTime}s</span>
                                                   </Button>
                                               ) : (
                                                   <div className="flex gap-2 w-full h-full"> 
                                                        {!set.completed && (
                                                            <Button className="h-full aspect-square rounded-2xl bg-zinc-800 hover:bg-zinc-700 hover:scale-105 transition-all" onClick={() => startStopwatch(currentExerciseIndex, idx)}>
                                                               <Mic className="w-6 h-6"/>
                                                            </Button>
                                                        )}
                                                        <Input type="number" className="h-full text-center text-3xl font-black bg-zinc-900/50 border-zinc-800 rounded-2xl" value={set.reps || ''} placeholder="0s" onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'reps', parseFloat(e.target.value))} />
                                                   </div>
                                               )}
                                           </div>
                                       ) : (
                                          <Input type="number" className={cn("h-16 text-center text-3xl font-black bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all", set.completed ? "text-emerald-500" : "text-white")} value={set.reps || ''} placeholder="0" onChange={(e) => handleUpdateSet(currentExerciseIndex, idx, 'reps', parseFloat(e.target.value))} />
                                       )}
                                   </td>
                                   <td className="p-4 text-center">
                                       {set.completed ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Badge className={cn("text-lg px-4 py-2 font-black uppercase text-black shadow-lg", set.grade === 'A' ? "bg-emerald-500 shadow-emerald-500/20" : set.grade === 'B' ? "bg-yellow-500 shadow-yellow-500/20" : "bg-red-500 shadow-red-500/20")}>
                                                    Grade: {set.grade}
                                                </Badge>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 hover:rotate-180 transition-transform duration-500" onClick={() => handleUpdateSet(currentExerciseIndex, idx, 'completed', false)}><RefreshCcw className="w-4 h-4"/></Button>
                                            </div>
                                       ) : (
                                           <div className="flex justify-center gap-2">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-emerald-500 hover:text-black font-black text-xl transition-colors" onClick={() => completeSetWithGrade(currentExerciseIndex, idx, 'A')}>A</motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-yellow-500 hover:text-black font-black text-xl transition-colors" onClick={() => completeSetWithGrade(currentExerciseIndex, idx, 'B')}>B</motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500 hover:text-black font-black text-xl transition-colors" onClick={() => completeSetWithGrade(currentExerciseIndex, idx, 'C')}>C</motion.button>
                                           </div>
                                       )}
                                   </td>
                               </tr>
                           )})}
                       </tbody>
                   </table>
                   <div className="p-6 flex justify-center sticky bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-12">
                       <Button variant="outline" className="h-12 border-dashed border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 uppercase font-bold tracking-widest text-xs px-8 rounded-xl" onClick={() => addSet(currentExerciseIndex)}><Plus className="w-4 h-4 mr-2"/> Add Interval</Button>
                   </div>
               </div>
           </div>
        </div>

        {!isFocusMode && (
        <div className="flex-1 lg:max-w-[380px] flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <Button variant={isPaused ? "default" : "outline"} className={cn("h-24 text-lg font-bold border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2", isPaused ? "bg-amber-500" : "bg-zinc-950")} onClick={() => setIsPaused(!isPaused)}>{isPaused ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}</Button>
                <Button className="h-24 text-lg font-bold bg-white text-black hover:bg-zinc-200 border-0 rounded-3xl flex flex-col items-center justify-center gap-2" onClick={finishWorkout}><CheckCircle2 className="w-8 h-8" /></Button>
            </div>
            <AnimatePresence>
                {isResting && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                         <div className="absolute inset-0 z-0">
                             <motion.div className="w-full h-full bg-cyan-500/10" animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /> 
                         </div>
                         <div className="absolute top-0 left-0 h-1 bg-amber-500 z-10" style={{ width: `${(restTimer/90)*100}%`, transition: 'width 1s linear' }} />
                        <div className="relative z-10 text-center">
                            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 flex justify-center items-center gap-2"><Wind className="w-4 h-4 animate-pulse text-cyan-500" /> Breathe & Recover</div>
                            <div className="text-7xl font-black tabular-nums tracking-tighter text-white mb-6 font-mono">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</div>
                            
                            {/* NEXT EXERCISE PREVIEW */}
                            {nextExercise && (
                                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center gap-3">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Up Next</span>
                                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{nextExercise.name}</span>
                                    <SkipForward className="w-3 h-3 text-zinc-500" />
                                </div>
                            )}

                            <div className="flex justify-center gap-3 mt-4">
                                <Button size="sm" className="bg-white hover:bg-zinc-200 text-black font-bold rounded-xl w-24 h-10" onClick={skipRestAndAdvance}>Skip</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 bg-zinc-950 rounded-[2.5rem] shadow-xl">
                 {/* Replaced standard Progress with Segmented Visual in the main HUD, so simplifying this sidebar list */}
                <div className="p-6 border-b border-zinc-900 bg-zinc-950">
                    <div className="flex justify-between items-end mb-4"><h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pipeline</h3><span className="text-xl font-black text-emerald-500">{Math.round(progress)}%</span></div>
                    <Progress value={progress} className="h-1 bg-zinc-900" indicatorClassName="bg-emerald-500" />
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {exercises.map((ex, idx) => {
                            const isCurrent = idx === currentExerciseIndex;
                            const setsDone = ex.sets.filter((s:any) => s.completed).length;
                            return (
                                <div key={idx} onClick={() => setCurrentExerciseIndex(idx)} className={cn("p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all border group", isCurrent ? "bg-zinc-900 border-zinc-700" : "bg-transparent border-transparent hover:bg-zinc-900")}>
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold", isCurrent ? "bg-white text-black" : "bg-zinc-800 text-zinc-500")}>{idx + 1}</div>
                                        <div className="truncate"><div className={cn("text-sm font-bold truncate transition-colors", isCurrent ? "text-white": "text-zinc-500")}>{ex.name}</div></div>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-600 font-bold">{setsDone}/{ex.sets.length}</div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
        )}

        <AnimatePresence>
            {isFocusMode && isResting && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 border border-zinc-800 rounded-full px-8 py-4 shadow-2xl flex items-center gap-8">
                     <div className="flex items-center gap-3"><Wind className="w-5 h-5 text-cyan-500 animate-pulse" /><span className="text-3xl font-black font-mono tabular-nums text-white">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</span></div>
                     <div className="flex flex-col gap-1 border-l border-zinc-800 pl-6">
                         <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Next</span>
                         <span className="text-xs font-bold text-white max-w-[120px] truncate">{nextExercise?.name || "Finish"}</span>
                     </div>
                     <Button size="sm" className="bg-white text-black font-bold rounded-full h-10 px-6 hover:bg-zinc-200" onClick={skipRestAndAdvance}>Skip</Button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
