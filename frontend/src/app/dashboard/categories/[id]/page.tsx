'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTaskStore } from '@/stores/taskStore'; // Assuming we have this
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Target, 
  Trophy, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Plus,
  MoreVertical,
  Activity,
  Zap
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { categories, fetchCategoriesWithStats } = useCategoryStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, toggleLog, logs, fetchLogs } = useTaskStore();
  
  const [category, setCategory] = useState<any>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('Medium');

  useEffect(() => {
    fetchCategoriesWithStats();
    fetchTasks();
    // Fetch logs for the current month for visual grid (mocking 'current month' logic for now)
    const start = new Date().toISOString().substring(0, 7) + '-01';
    const end = new Date().toISOString().substring(0, 10);
    fetchLogs(start, end);
  }, [fetchCategoriesWithStats, fetchTasks, fetchLogs]);

  useEffect(() => {
    if (categories.length > 0 && id) {
      const found = categories.find(c => c._id === id);
      if (found) {
          setCategory(found);
      }
    }
  }, [categories, id]);

  const categoryTasks = tasks.filter(t => 
      typeof t.category === 'object' ? t.category?._id === id : t.category === id
  );

  const handleCreateTask = async () => {
      if (!newTaskTitle) return;
      await createTask({
          title: newTaskTitle,
          difficulty: newTaskDifficulty,
          category: id,
          active: true,
          startDate: new Date()
      });
      setNewTaskTitle('');
      setIsTaskDialogOpen(false);
  };

  if (!category) return <div className="p-10 font-mono">Loading Neural Interface...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER Nav */}
      <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-muted-foreground">System Architecture / {category.name}</h2>
          </div>
      </div>

      {/* MATRIX HERO */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-8 md:p-12 text-white">
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                      <Activity className="w-3 h-3" /> Level {category.level || 1}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                      {category.name} <span className="text-zinc-700">Protocol</span>
                  </h1>
                  <p className="text-zinc-400 max-w-2xl text-lg md:text-xl font-light">
                      Centralized command for {category.name} operations. Execute daily tasks to compile XP and elevate mastery level.
                  </p>
                  
                  <div className="pt-4 flex items-center gap-8">
                       <div>
                           <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">XP Accumulation</div>
                           <div className="text-3xl font-mono font-bold text-white">{(category.xp || 0).toLocaleString()} <span className="text-sm text-zinc-600">XP</span></div>
                       </div>
                       <div>
                           <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">Next Milestone</div>
                           <div className="text-3xl font-mono font-bold text-white">{100 - (category.progress || 0)}% <span className="text-sm text-zinc-600">to go</span></div>
                       </div>
                  </div>
              </div>

              {/* Progress Circle Visual (Abstract) */}
              <div className="hidden md:flex items-center justify-center relative">
                  <div className="w-48 h-48 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow duration-[10s]" style={{ opacity: (category.progress || 0) / 100 }}></div>
                      <div className="text-center">
                          <div className="text-5xl font-black text-white">{category.progress || 0}%</div>
                          <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Efficiency</div>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />
      </div>

      {/* ACTIVE DIRECTIVES (TASKS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Task List */}
          <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Target className="w-6 h-6 text-primary" /> Active Directives
                  </h3>
                  
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-bold shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4 mr-2" /> Add Directive
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New {category.name} Directive</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Directive Title</Label>
                                    <Input 
                                        placeholder="e.g., Complete 30min Research" 
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Complexity Class</Label>
                                    <Select value={newTaskDifficulty} onValueChange={setNewTaskDifficulty}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Class I (Easy - 10 XP)</SelectItem>
                                            <SelectItem value="Medium">Class II (Medium - 25 XP)</SelectItem>
                                            <SelectItem value="Hard">Class III (Hard - 50 XP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateTask} disabled={!newTaskTitle}>Initialize Directive</Button>
                            </DialogFooter>
                        </DialogContent>
                  </Dialog>
              </div>

              <div className="grid gap-3">
                  {categoryTasks.map((task) => {
                      const today = new Date().toISOString().split('T')[0]; // Simple date strong
                      const isCompleted = logs[`${task._id}-${today}`];
                      
                      return (
                          <div key={task._id} className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => toggleLog(task._id, today)}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-primary border-primary text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-primary text-transparent'}`}
                                  >
                                      <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                  <div>
                                      <h4 className={`font-bold text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                                          <span className={`px-1.5 rounded-sm ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                              {task.difficulty}
                                          </span>
                                          <span>•</span>
                                          <span>+{task.difficulty === 'Hard' ? 50 : task.difficulty === 'Medium' ? 25 : 10} XP</span>
                                      </div>
                                  </div>
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                          <MoreVertical className="w-4 h-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem className="text-red-500" onClick={() => deleteTask(task._id)}>
                                          Terminate Directive
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      );
                  })}
                  
                  {categoryTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                              <Zap className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <h4 className="font-bold text-muted-foreground">No Active Directives</h4>
                          <p className="text-sm text-muted-foreground max-w-xs mt-1">Initialize protocols to begin tracking progress in this domain.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Side Panel Info */}
          <div className="space-y-6">
               <Card className="bg-zinc-900 text-white border-zinc-800">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-lg">
                           <Trophy className="w-5 h-5 text-yellow-500" /> Mastery Rewards
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                           <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold">L5</div>
                           <div>
                               <div className="font-bold text-sm">Advanced Analytics</div>
                               <div className="text-xs text-zinc-500">Unlocks deeper insights</div>
                           </div>
                       </div>
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 grayscale opacity-60">
                           <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">L10</div>
                           <div>
                               <div className="font-bold text-sm">Mastery Badge</div>
                               <div className="text-xs text-zinc-500">Public profile recognition</div>
                           </div>
                       </div>
                   </CardContent>
               </Card>
          </div>
      </div>
    </div>
  );
}
