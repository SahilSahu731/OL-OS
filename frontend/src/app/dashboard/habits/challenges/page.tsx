'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { 
    Trophy, Flame, Swords, CalendarCheck, AlertTriangle, Users, Lock, 
    ChevronRight, Check, X, Plus, BrainCircuit, History, Upload, Image as ImageIcon, Zap, Crown, Trash2, Skull
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallengeStore, Challenge } from '@/stores/challengeStore';
import { Switch } from '@/components/ui/switch';

// --- CONSTANTS ---

const XP_PER_LOG = 100;

const REFLECTION_QUESTIONS = [
    "What was the moment you almost gave up today?",
    "Did you act like the person you want to become?",
    "What distraction tried to steal your focus?",
    "Why does this goal matter to you right now?",
    "Rate your discipline today (1-10) and explain why.",
    "What is one thing you did today that your future self will thank you for?",
    "Identify a weakness you overcame today.",
];

// --- COMPONENTS ---

const HeatmapSquare = ({ status }: { status: string }) => {
    const colors = {
        'success': 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
        'failed': 'bg-red-500/50',
        'missed': 'bg-red-500/50',
        'pending': 'bg-zinc-800 border border-zinc-700'
    };
    return (
        <div className={cn("w-3 h-3 rounded-[2px] transition-all hover:scale-125 cursor-help", colors[status as keyof typeof colors] || colors['pending'])} title={status} />
    );
};

export default function ChallengesPage() {
    const { challenges, fetchChallenges, createChallenge, logProgress, failChallenge, deleteChallenge, isLoading } = useChallengeStore();
    const [activeTab, setActiveTab] = useState<'my' | 'browse'>('my');
    
    // Log Dialog State
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
    const [logStep, setLogStep] = useState<'checklist' | 'reflection'>('checklist');
    const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
    const [reflectionAnswer, setReflectionAnswer] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(REFLECTION_QUESTIONS[0]);
    const [proofFile, setProofFile] = useState<string | null>(null);

    // Create Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        description: '',
        daysTotal: 30,
        icon: '⚔️',
        mode: 'standard', // 'standard' | 'hardcore'
        stakes: '',
        rules: [''] 
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleOpenLog = (challengeId: string) => {
        setActiveChallengeId(challengeId);
        setLogStep('checklist');
        setChecklistState({});
        setProofFile(null);
        const randomQ = REFLECTION_QUESTIONS[Math.floor(Math.random() * REFLECTION_QUESTIONS.length)];
        setCurrentQuestion(randomQ);
        setReflectionAnswer('');
        setIsLogOpen(true);
    };

    const handleCheckItem = (idx: number) => {
        setChecklistState(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleConfirmLog = async () => {
        if (!activeChallengeId) return;
        
        await logProgress(activeChallengeId, {
            date: new Date().toISOString(),
            completed: true,
            reflection: {
                question: currentQuestion,
                answer: reflectionAnswer
            },
            checklist: Object.values(checklistState)
        });

        setIsLogOpen(false);
        toast.success("Day logged successfully. Rank Updated.");
    };

    const handleFailChallenge = async (id: string, name: string) => {
        const confirm = window.confirm(`Are you sure you want to admit defeat on ${name}? This cannot be undone.`);
        if (confirm) {
            await failChallenge(id);
            toast.error("Failure Recorded. Try again when you are stronger.");
        }
    }

    const handleCreateChallenge = async () => {
        if (!newChallenge.title) return;
        await createChallenge({
            ...newChallenge,
            rules: newChallenge.rules.filter(r => r.length > 0).map(r => ({ text: r, type: 'boolean' })),
            status: 'active',
            theme: newChallenge.mode === 'hardcore' ? 'red' : 'blue'
        });
        setIsCreateOpen(false);
        setNewChallenge({ title: '', description: '', daysTotal: 30, icon: '⚔️', mode: 'standard', stakes: '', rules: [''] });
        setActiveTab('my');
        toast.success("New Challenge Initiated");
    };

    const addRuleField = () => {
        setNewChallenge(prev => ({ ...prev, rules: [...prev.rules, ''] }));
    };

    const updateRule = (idx: number, val: string) => {
        const newRules = [...newChallenge.rules];
        newRules[idx] = val;
        setNewChallenge(prev => ({ ...prev, rules: newRules }));
    };

    const activeChallenge = challenges.find(c => c._id === activeChallengeId);
    // @ts-ignore
    const myChallenges = challenges.filter(c => c.status !== 'available'); // Show active, failed, and completed in 'my' for history context

    return (
        <div className="space-y-8 min-h-screen pb-20">
             {/* HEADER */}
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-500" /> Challenge Command
                    </h1>
                     <p className="text-muted-foreground mt-1">High-stakes sprints to prove your discipline.</p>
                </div>
                
                 <div className="bg-secondary/50 p-1 rounded-lg flex items-center gap-1">
                    <Button 
                        variant={activeTab === 'my' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActiveTab('my')}
                        className="shadow-none"
                    >
                        Active Battles
                    </Button>
                    <Button 
                        variant={activeTab === 'browse' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActiveTab('browse')}
                    >
                        Browse Arena
                    </Button>
                 </div>
            </div>

            <HabitNav />

            {/* MY CHALLENGES (ACTIVE) */}
            {activeTab === 'my' && (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                    {activeTab === 'my' && myChallenges.length === 0 && !isLoading && (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                            <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold text-muted-foreground">No Active Battles</h3>
                            <p className="text-sm text-muted-foreground mb-4">You are currently at peace. That is a problem.</p>
                            <Button onClick={() => setIsCreateOpen(true)}>Initiate Protocol</Button>
                        </div>
                    )}

                    {myChallenges.map((challenge: any) => {
                        const progress = (challenge.daysCompleted / challenge.daysTotal) * 100;
                        const rank = progress < 25 ? "Novice" : progress < 50 ? "Adept" : progress < 75 ? "Elite" : "Titan";
                        const xpEarned = challenge.daysCompleted * XP_PER_LOG;
                        const streak = challenge.logs?.length || 0; 
                        const lastLog = challenge.logs && challenge.logs.length > 0 ? challenge.logs[challenge.logs.length - 1] : null;

                        const isHardcore = challenge.mode === 'hardcore';
                        const isFailed = challenge.status === 'failed';

                        return (
                        <div key={challenge._id} className={cn("relative group transition-all duration-500", isFailed ? "opacity-60 grayscale" : "")}>
                             {/* GLOW EFFECT */}
                             <div className={cn(
                                 "absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500",
                                 isHardcore ? "bg-gradient-to-r from-red-600 to-red-900 animate-pulse" : "bg-gradient-to-r from-blue-600 to-purple-600",
                                 isFailed ? "bg-zinc-800 opacity-10 blur-0" : ""
                             )} />
                             
                             <Card className="relative border-0 bg-background/95 backdrop-blur-xl overflow-hidden shadow-2xl">
                                 {/* Background Texture - The War Room */}
                                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                                 <div className={cn(
                                     "absolute top-0 right-0 p-32 blur-[100px] rounded-full pointer-events-none transition-colors duration-500",
                                     isHardcore ? "bg-red-500/10" : "bg-blue-500/10",
                                     isFailed ? "bg-black" : ""
                                 )} />

                                 <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => deleteChallenge(challenge._id!)} title="Delete Challenge">
                                         <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                     </Button>
                                 </div>

                                 <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                                    
                                    {/* COL 1: IDENTITY & LEVEL (Span 4) */}
                                    <div className="lg:col-span-4 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left border-r border-border/50 pr-8">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="relative shrink-0">
                                                <div className={cn("text-6xl bg-secondary/50 p-4 rounded-2xl relative overflow-hidden", isFailed && "grayscale")}>
                                                    {challenge.icon}
                                                    {isHardcore && !isFailed && <Skull className="absolute -top-1 -right-1 w-6 h-6 text-red-500 animate-pulse" />}
                                                </div>
                                                <Badge className={cn(
                                                    "absolute -bottom-2 -right-2 border-2 border-background text-sm px-2 uppercase tracking-widest",
                                                    isFailed ? "bg-zinc-600" : isHardcore ? "bg-red-600 text-white" : "bg-blue-600"
                                                )}>
                                                    {isFailed ? "KIA" : isHardcore ? "Hardcore" : "Standard"}
                                                </Badge>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter truncate">{challenge.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                                                    <Crown className="w-3 h-3 text-amber-500" />
                                                    <span className="text-amber-500 font-bold uppercase">{rank} Rank</span>
                                                    <span>•</span>
                                                    <span>{xpEarned} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2 p-4 rounded-lg bg-secondary/20 border border-border/50">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                <span>Mission Progress</span>
                                                <span className="text-foreground">{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-3 bg-red-950/20" indicatorClassName={cn("bg-gradient-to-r", isFailed ? "from-zinc-500 to-zinc-700" : isHardcore ? "from-red-600 to-red-900" : "from-blue-600 to-purple-500")} />
                                            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                                                <span>Day {challenge.daysCompleted}</span>
                                                <span>Target: Day {challenge.daysTotal}</span>
                                            </div>
                                        </div>

                                        {/* Heatmap Mini */}
                                        <div className="w-full">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-widest">Recent Consistency</p>
                                            <div className="flex gap-1 flex-wrap">
                                                {(challenge.heatmap || []).map((status: string, i: number) => (
                                                    <HeatmapSquare key={i} status={status} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* COL 2: RULES & INTEL (Span 5) */}
                                    <div className="lg:col-span-5 space-y-6 lg:px-4">
                                         <div>
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                                <Lock className="w-4 h-4" /> Daily Protocols
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {challenge.rules.map((rule: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-background border border-border/50 shadow-sm">
                                                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-border" />
                                                        </div>
                                                        <span className="opacity-90 font-medium">{rule.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                         </div>

                                         {challenge.stakes && (
                                             <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-lg flex gap-3 text-red-400">
                                                 <AlertTriangle className="w-5 h-5 shrink-0" />
                                                 <div>
                                                     <p className="text-[10px] uppercase font-bold tracking-widest mb-1">Stakes at Risk</p>
                                                     <p className="text-sm italic">"{challenge.stakes}"</p>
                                                 </div>
                                             </div>
                                         )}

                                         {lastLog?.reflection?.answer && !isFailed && (
                                             <div className="bg-zinc-950 text-zinc-300 p-4 rounded-lg text-sm border border-zinc-800 italic relative overflow-hidden group/reflection cursor-help">
                                                <div className="absolute top-0 right-0 p-8 bg-blue-500/5 blur-2xl rounded-full" />
                                                <BrainCircuit className="absolute top-3 right-3 w-4 h-4 text-zinc-700" />
                                                 <p className="text-zinc-500 text-[10px] font-bold uppercase mb-2 tracking-wider">Yesterday's Intel</p>
                                                 <p className="mb-2 text-zinc-400">"{lastLog.reflection.question}"</p>
                                                 <p className="text-white font-medium pl-2 border-l-2 border-zinc-700">"{lastLog.reflection.answer}"</p>
                                             </div>
                                         )}
                                    </div>

                                    {/* COL 3: ACTIONS & STREAK (Span 3) */}
                                    <div className="lg:col-span-3 flex flex-col gap-4 border-l border-border/50 pl-8">
                                        
                                        {/* Streak Card */}
                                        <div className={cn(
                                            "p-4 rounded-xl border text-center transition-all",
                                            isFailed ? "bg-zinc-900 border-zinc-800 opacity-50" : "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20"
                                        )}>
                                            <div className="flex justify-center mb-2">
                                                {isFailed ? <X className="w-6 h-6 text-zinc-500" /> : <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />}
                                            </div>
                                            <div className="text-3xl font-black">{streak}</div>
                                            <div className="text-[10px] uppercase font-bold text-orange-600 tracking-widest">Day Streak</div>
                                            <div className="mt-2 text-[10px] text-muted-foreground">
                                                {isFailed ? "Prophecy Failed" : "Keep burning"}
                                            </div>
                                        </div>

                                        <div className="flex-1" />

                                        {!isFailed && (
                                            <>
                                                <Button 
                                                    size="lg" 
                                                    onClick={() => handleOpenLog(challenge._id!)}
                                                    className={cn(
                                                        "w-full h-14 font-bold text-base shadow-xl transition-all hover:scale-[1.02] flex flex-col gap-0 items-center justify-center",
                                                        isHardcore ? "bg-red-600 hover:bg-red-700 text-white" : "bg-foreground text-background hover:bg-foreground/90"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Log Day {challenge.daysCompleted + 1}</span>
                                                </Button>
                                                
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => handleFailChallenge(challenge._id!, challenge.title)}
                                                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs uppercase tracking-widest opacity-50 hover:opacity-100"
                                                >
                                                    Admit Defeat
                                                </Button>
                                            </>
                                        )}
                                        {isFailed && (
                                            <div className="text-center p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
                                                <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Challenge Failed</p>
                                                <p className="text-[10px] text-red-400 mt-1">Stakes lost. Acknowledge and restart.</p>
                                            </div>
                                        )}
                                    </div>
                                 </div>
                             </Card>
                        </div>
                    );
                    })}
                </div>
            )}

            {/* BROWSE CHALLENGES */}
            {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
                     <Card 
                        onClick={() => setIsCreateOpen(true)}
                        className="border-dashed flex flex-col items-center justify-center p-8 text-center space-y-4 hover:bg-secondary/10 transition-colors cursor-pointer text-muted-foreground hover:text-foreground h-[300px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold">Design Custom Gauntlet</h3>
                        <p className="text-sm px-8">Define your own rules. Set your own pain.</p>
                    </Card>

                    {/* Placeholder for community challenges if we had them */}
                     <Card className="group hover:border-primary transition-colors opacity-75">
                         <CardHeader>
                             <div className="flex justify-between items-start mb-2">
                                 <div className="text-4xl shadow-sm rounded-xl p-2 bg-secondary/30">🧠</div>
                                 <Badge variant="outline" className="uppercase tracking-wide">75 Days</Badge>
                             </div>
                             <CardTitle className="text-xl">75 HARD</CardTitle>
                             <CardDescription>The ultimate mental toughness challenge template.</CardDescription>
                         </CardHeader>
                         <CardFooter>
                             <Button disabled className="w-full">Coming Soon</Button>
                         </CardFooter>
                     </Card>
                </div>
            )}

            {/* DAILY LOG DIALOG (Same as before but connected) */}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogContent className="sm:max-w-[600px] border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl p-0 gap-0 overflow-hidden">
                    <div className="h-2 w-full bg-zinc-900">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 to-amber-500" 
                            initial={{ width: '0%' }}
                            animate={{ width: logStep === 'checklist' ? '50%' : '100%' }}
                        />
                    </div>
                    
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2 text-xl font-light tracking-wide uppercase">
                            {logStep === 'checklist' ? 'Protocol Verification' : 'The Mirror'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {logStep === 'checklist' ? 'Confirm execution of all daily protocols.' : 'Face yourself and reflect on the battle.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-4 h-[400px] overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {logStep === 'checklist' ? (
                                <motion.div 
                                    key="checklist" 
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    {activeChallenge?.rules.map((rule: any, i: number) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleCheckItem(i)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border border-zinc-800 cursor-pointer transition-all hover:bg-zinc-900",
                                                checklistState[i] ? "bg-green-950/20 border-green-900/50" : "bg-zinc-900/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                                                checklistState[i] ? "bg-green-600 border-green-600 text-white" : "border-zinc-700"
                                            )}>
                                                {checklistState[i] && <Check className="w-4 h-4" />}
                                            </div>
                                            <span className={cn("text-lg font-light", checklistState[i] ? "text-zinc-300" : "text-zinc-500")}>
                                                {rule.text}
                                            </span>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-6 pt-6 border-t border-zinc-900">
                                        <Label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Optional: Evidence</Label>
                                        <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                                            {proofFile ? (
                                                <div className="flex flex-col items-center text-green-500">
                                                    <Check className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">Evidence Attached</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-zinc-600 group-hover:text-zinc-400" onClick={() => setProofFile('simulated')}>
                                                    <Upload className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">Upload Photo / Screenshot</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="reflection"
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2 text-center py-4">
                                        <h3 className="text-2xl font-serif italic text-white leading-relaxed">"{currentQuestion}"</h3>
                                    </div>
                                    
                                    <div className="relative">
                                        <Textarea 
                                            value={reflectionAnswer}
                                            onChange={(e) => setReflectionAnswer(e.target.value)}
                                            placeholder="Write your truth here..."
                                            className="min-h-[150px] bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 resize-none text-lg p-4 font-light leading-relaxed"
                                            autoFocus
                                        />
                                        <div className="flex justify-between mt-2">
                                            <span className={cn("text-xs opacity-50", reflectionAnswer.length < 20 ? "text-red-500" : "text-zinc-500")}>
                                                {reflectionAnswer.length}/20 minimum characters
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DialogFooter className="p-6 bg-zinc-900/50 border-t border-zinc-900 flex justify-between items-center w-full">
                        {logStep === 'reflection' && (
                             <Button variant="ghost" onClick={() => setLogStep('checklist')} className="text-zinc-500 hover:text-white">
                                Back
                             </Button>
                        )}
                        <div className="ml-auto">
                            {logStep === 'checklist' ? (
                                <Button 
                                    onClick={() => setLogStep('reflection')}
                                    disabled={activeChallenge && Object.keys(checklistState).length < activeChallenge.rules.length}
                                    className="bg-white text-black hover:bg-zinc-200 font-bold px-8 transition-all disabled:opacity-50"
                                >
                                    Next Phase <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleConfirmLog} 
                                    disabled={reflectionAnswer.length < 20}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 transition-all disabled:opacity-50"
                                >
                                    Confirm Victory
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CREATE DIALOG V2 */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Custom Gauntlet</DialogTitle>
                        <DialogDescription>Define the terms of your next battle.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid gap-2">
                            <Label>Challenge Name</Label>
                            <Input 
                                placeholder="e.g. Project 50" 
                                value={newChallenge.title}
                                onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea 
                                placeholder="Why are you doing this?" 
                                value={newChallenge.description}
                                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Duration (Days)</Label>
                                <Input 
                                    type="number" 
                                    value={newChallenge.daysTotal}
                                    onChange={(e) => setNewChallenge({...newChallenge, daysTotal: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Icon</Label>
                                <Select value={newChallenge.icon} onValueChange={(val) => setNewChallenge({...newChallenge, icon: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="⚔️">⚔️ Swords</SelectItem>
                                        <SelectItem value="🧠">🧠 Brain</SelectItem>
                                        <SelectItem value="💪">💪 Muscle</SelectItem>
                                        <SelectItem value="🧘">🧘 Zenith</SelectItem>
                                        <SelectItem value="💀">💀 Death</SelectItem>
                                        <SelectItem value="🦅">🦅 Freedom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className={cn("text-base", newChallenge.mode === 'hardcore' ? "text-red-500 font-bold" : "text-zinc-200")}>
                                    {newChallenge.mode === 'hardcore' ? 'HARDCORE MODE' : 'Standard Mode'}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {newChallenge.mode === 'hardcore' ? 'One strike and you fail immediately. No mercy.' : 'Can survive 3 missed days.'}
                                </p>
                            </div>
                            <Switch 
                                checked={newChallenge.mode === 'hardcore'}
                                onCheckedChange={(c) => setNewChallenge({...newChallenge, mode: c ? 'hardcore' : 'standard'})}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Stakes (Validation Contract)</Label>
                            <Textarea 
                                placeholder="If I fail, I will..." 
                                value={newChallenge.stakes}
                                onChange={(e) => setNewChallenge({...newChallenge, stakes: e.target.value})}
                                className="border-red-500/30 focus:border-red-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Rules (The Protocols)</Label>
                            {newChallenge.rules.map((rule, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input 
                                        value={rule} 
                                        onChange={(e) => updateRule(idx, e.target.value)}
                                        placeholder={`Rule #${idx + 1}`}
                                    />
                                </div>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={addRuleField} className="text-xs">
                                + Add Rule
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateChallenge} className={cn("w-full", newChallenge.mode === 'hardcore' && "bg-red-600 hover:bg-red-700")}>
                            {newChallenge.mode === 'hardcore' ? 'Init Hardcore Protocol' : 'Start Challenge'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
