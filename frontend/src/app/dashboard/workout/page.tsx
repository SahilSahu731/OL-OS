'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore, Workout, Exercise, ExerciseSet } from '@/stores/workoutStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, Calendar, Clock, Dumbbell, History, Trophy, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// --------------------------------------------------------------------------------
// TEMPLATES
// --------------------------------------------------------------------------------

const TEMPLATE_WORKOUTS = [
    {
        name: "Upper Body Calisthenics",
        duration: 45,
        notes: "Focus on form and slow negatives.",
        exercises: [
            { name: "Push-ups", sets: [{ weight: 0, reps: 12, completed: false }, { weight: 0, reps: 12, completed: false }, { weight: 0, reps: 10, completed: false }] },
            { name: "Pull-ups (or Bodyweight Rows)", sets: [{ weight: 0, reps: 8, completed: false }, { weight: 0, reps: 8, completed: false }, { weight: 0, reps: 6, completed: false }] },
            { name: "Pike Push-ups", sets: [{ weight: 0, reps: 8, completed: false }, { weight: 0, reps: 8, completed: false }, { weight: 0, reps: 8, completed: false }] },
            { name: "Dips (Box/Chair)", sets: [{ weight: 0, reps: 10, completed: false }, { weight: 0, reps: 10, completed: false }, { weight: 0, reps: 10, completed: false }] },
            { name: "Plank Hold", sets: [{ weight: 0, reps: 60, completed: false }, { weight: 0, reps: 60, completed: false }] },
        ]
    },
    {
        name: "Lower Body Power",
        duration: 40,
        notes: "Explosive movements. Rest 90s between sets.",
        exercises: [
            { name: "Bodyweight Squats", sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }] },
            { name: "Walking Lunges", sets: [{ weight: 0, reps: 12, completed: false }, { weight: 0, reps: 12, completed: false }, { weight: 0, reps: 12, completed: false }] },
            { name: "Glute Bridges", sets: [{ weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }, { weight: 0, reps: 15, completed: false }] },
            { name: "Calf Raises", sets: [{ weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }, { weight: 0, reps: 20, completed: false }] },
            { name: "Jump Squats (Finisher)", sets: [{ weight: 0, reps: 10, completed: false }, { weight: 0, reps: 10, completed: false }] },
        ]
    },
    {
        name: "Deep Stretch & Mobility",
        duration: 30,
        notes: "Hold each pose for 30-60 seconds. Breathe deeply.",
        exercises: [
            { name: "Cat-Cow Stretch", sets: [{ weight: 0, reps: 1, completed: false }] },
            { name: "Hamstring Fold", sets: [{ weight: 0, reps: 1, completed: false }] },
            { name: "Hip Flexor Lunge", sets: [{ weight: 0, reps: 1, completed: false }, { weight: 0, reps: 1, completed: false }] },
            { name: "Pigeon Pose", sets: [{ weight: 0, reps: 1, completed: false }, { weight: 0, reps: 1, completed: false }] },
            { name: "Child's Pose", sets: [{ weight: 0, reps: 1, completed: false }] },
        ]
    }
];

const WEEKLY_PLAN = [
    { day: 'Monday', template: TEMPLATE_WORKOUTS[0] },
    { day: 'Tuesday', template: TEMPLATE_WORKOUTS[1] },
    { day: 'Wednesday', template: null, text: 'Active Recovery' },
    { day: 'Thursday', template: TEMPLATE_WORKOUTS[0] },
    { day: 'Friday', template: TEMPLATE_WORKOUTS[1] },
    { day: 'Saturday', template: TEMPLATE_WORKOUTS[2] },
    { day: 'Sunday', template: null, text: 'Rest & Prep' },
];

export default function WorkoutPage() {
  const { workouts, fetchWorkouts, createWorkout, deleteWorkout, isLoading } = useWorkoutStore();
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState<any>(null);

  const startTemplate = (template: any) => {
      setInitialTemplate(template);
      setIsLoggingOpen(true);
  };

  const handleOpenLogging = () => {
      setInitialTemplate(null);
      setIsLoggingOpen(true);
  };

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Derived Stats
  const totalWorkouts = workouts.length;
  // Calculate Streak (Simplified)
  const calculateStreak = () => {
    // This would need more complex logic with dates
    return 0; 
  };
  
  const getWeeklyVolume = () => {
    // Sum of weight * reps for this week
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Lab</h1>
          <p className="text-muted-foreground">Manage your training, track progress, and crush your goals.</p>
        </div>
        <Button size="lg" onClick={handleOpenLogging} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Dumbbell className="mr-2 h-5 w-5" />
          Log Workout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">All time sessions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Volume</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Lbs moved this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Consecutive weeks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Output</CardTitle>
                <History className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Avg. intensity</p>
            </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Columns */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {WEEKLY_PLAN.map((dayPlan, idx) => (
                <Card key={idx} className={`flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50 ${dayPlan.template ? 'border-zinc-200 dark:border-zinc-800' : 'border-dashed border-zinc-200 dark:border-zinc-800 opacity-70'}`}>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">{dayPlan.day}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-center">
                        {dayPlan.template ? (
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-base leading-tight">{dayPlan.template.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{dayPlan.template.duration} min</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full bg-white dark:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-700 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                    onClick={() => startTemplate(dayPlan.template)}
                                >
                                    <Plus className="h-3 w-3 mr-2" /> Start
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-2">
                                <span className="text-sm font-medium text-muted-foreground italic">{dayPlan.text}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Workouts List */}
        <div className="md:col-span-12 lg:col-span-12 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.length === 0 ? (
                <Card className="border-dashed col-span-full">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Dumbbell className="h-10 w-10 mb-4 opacity-20" />
                        <p>No workouts logged yet.</p>
                        <p className="text-sm">Start your journey today!</p>
                    </CardContent>
                </Card>
            ) : (
                workouts.map((workout) => (
                    <Card key={workout._id} className="group hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(workout.date || new Date()), 'PPP')}</span>
                                        {workout.duration > 0 && (
                                            <>
                                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                <Clock className="h-3 w-3" />
                                                <span>{workout.duration} min</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteWorkout(workout._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {workout.exercises.slice(0, 3).map((ex, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-l-2 border-primary/20 pl-3">
                                        <span className="font-medium">{ex.name}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {ex.sets.length} sets • Best: {Math.max(0, ...ex.sets.map(s => s.weight || 0))} lbs
                                        </span>
                                    </div>
                                ))}
                                {workout.exercises.length > 3 && (
                                    <p className="text-xs text-muted-foreground pl-3 pt-1">
                                        + {workout.exercises.length - 3} more exercises
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
            </div>
        </div>
      </div>

      {/* Log Workout Dialog */}
      <LogWorkoutDialog 
        open={isLoggingOpen} 
        onOpenChange={setIsLoggingOpen} 
        onSave={createWorkout} 
        initialData={initialTemplate}
      />
    </div>
  );
}

// --------------------------------------------------------------------------------
// SUB-COMPONENTS
// --------------------------------------------------------------------------------

function LogWorkoutDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    initialData 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    onSave: (data: any) => Promise<void>,
    initialData?: any
}) {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Reset form when opened or when initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name || '');
                setDuration(initialData.duration?.toString() || '');
                setNotes(initialData.notes || '');
                // Deep copy exercises to avoid mutating template
                setExercises(JSON.parse(JSON.stringify(initialData.exercises || [])));
            } else {
                setName('');
                setDuration('');
                setNotes('');
                setExercises([]);
            }
        }
    }, [open, initialData]);

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: [{ weight: 0, reps: 0, completed: false }] }]);
    };

    const updateExerciseName = (index: number, val: string) => {
        const newEx = [...exercises];
        newEx[index].name = val;
        setExercises(newEx);
    };

    const addSet = (exIndex: number) => {
        const newEx = [...exercises];
        const prevSet = newEx[exIndex].sets[newEx[exIndex].sets.length - 1];
        newEx[exIndex].sets.push({ 
            weight: prevSet ? prevSet.weight : 0, 
            reps: prevSet ? prevSet.reps : 0, 
            completed: false 
        });
        setExercises(newEx);
    };

    const removeSet = (exIndex: number, setIndex: number) => {
        const newEx = [...exercises];
        newEx[exIndex].sets.splice(setIndex, 1);
        setExercises(newEx);
    };

    const updateSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, val: number) => {
        const newEx = [...exercises];
        const set = newEx[exIndex].sets[setIndex];
        if (set && typeof val === 'number') {
            (set as any)[field] = val;
        }
        setExercises(newEx);
    };

    const removeExercise = (index: number) => {
        const newEx = [...exercises];
        newEx.splice(index, 1);
        setExercises(newEx);
    };

    const handleSave = async () => {
        await onSave({
            name: name || 'Untitled Workout',
            duration: parseInt(duration) || 0,
            notes,
            exercises
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Log Workout</DialogTitle>
                    <DialogDescription>Record your session details below.</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Workout Name</Label>
                            <Input placeholder="e.g. Push Day" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (min)</Label>
                            <Input type="number" placeholder="60" value={duration} onChange={e => setDuration(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Exercises</Label>
                        <div className="space-y-4">
                            {exercises.map((ex, exIndex) => (
                                <Card key={exIndex} className="bg-muted/30">
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold text-xs">
                                                {exIndex + 1}
                                            </div>
                                            <Input 
                                                className="flex-1 font-semibold" 
                                                placeholder="Exercise Name (e.g. Bench Press)" 
                                                value={ex.name}
                                                onChange={e => updateExerciseName(exIndex, e.target.value)}
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => removeExercise(exIndex)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2 pl-9">
                                            <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-muted-foreground mb-1 px-1">
                                                <div className="col-span-1">SET</div>
                                                <div className="col-span-4">LBS</div>
                                                <div className="col-span-4">REPS</div>
                                                <div className="col-span-1"></div>
                                            </div>
                                            {ex.sets.map((set, setIndex) => (
                                                <div key={setIndex} className="grid grid-cols-10 gap-2 items-center">
                                                    <div className="col-span-1 flex justify-center">
                                                        <span className="text-xs text-muted-foreground font-mono bg-zinc-200 dark:bg-zinc-800 w-5 h-5 rounded-full flex items-center justify-center">
                                                            {setIndex + 1}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-4">
                                                        <Input 
                                                            type="number" 
                                                            className="h-8 text-center" 
                                                            value={set.weight} 
                                                            onChange={e => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="col-span-4">
                                                        <Input 
                                                            type="number" 
                                                            className="h-8 text-center" 
                                                            value={set.reps} 
                                                            onChange={e => updateSet(exIndex, setIndex, 'reps', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="col-span-1 flex justify-center">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSet(exIndex, setIndex)}>
                                                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" onClick={() => addSet(exIndex)} className="w-full text-xs h-7 dashed border">
                                                <Plus className="h-3 w-3 mr-1" /> Add Set
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <Button variant="outline" onClick={addExercise} className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Add Exercise
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="How did it feel?" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                </div>

                <DialogFooter>
                     <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                     <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Workout</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
