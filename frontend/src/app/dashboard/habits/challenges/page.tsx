'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { Trophy, Flame, Swords, CalendarCheck, AlertTriangle, Users, Lock, ChevronRight, Check, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    theme: 'red' | 'gold' | 'blue' | 'purple';
    daysTotal: number;
    daysCompleted: number;
    status: 'active' | 'completed' | 'failed' | 'available';
    strikes: number; // Max usually 3
    participants: number;
    rules: string[];
}

const DEFAULT_CHALLENGES: Challenge[] = [
    {
        id: 'c1',
        title: '75 HARD',
        description: 'The ultimate mental toughness challenge.',
        icon: '🧠',
        theme: 'red',
        daysTotal: 75,
        daysCompleted: 12,
        status: 'active',
        strikes: 0,
        participants: 12405,
        rules: ['Two 45m workouts (one outdoor)', 'Drink 1 gallon of water', 'Read 10 pages', 'Follow a diet', 'No alcohol/cheat meals', 'Take progress pic']
    },
    {
        id: 'c2',
        title: 'Monk Mode November',
        description: 'Absolute focus and dopamine detox.',
        icon: '🧘',
        theme: 'purple',
        daysTotal: 30,
        daysCompleted: 0,
        status: 'available',
        strikes: 0,
        participants: 450,
        rules: ['No social media', 'No video games', 'Daily meditation', 'Deep work 4h+']
    },
    {
        id: 'c3',
        title: 'Sober October',
        description: 'Reset your body and mind.',
        icon: '💧',
        theme: 'blue',
        daysTotal: 31,
        daysCompleted: 31,
        status: 'completed',
        strikes: 0,
        participants: 890,
        rules: ['No alcohol', 'No weed', 'No sugar']
    }
];

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
    const [activeTab, setActiveTab] = useState<'my' | 'browse'>('my');

    return (
        <div className="space-y-8 min-h-screen pb-20">
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-500" /> Challenge Arena
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
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                    {challenges.filter(c => c.status === 'active').map(challenge => (
                        <Card key={challenge.id} className="border-l-4 border-l-red-500 overflow-hidden relative">
                             {/* Background Texture */}
                             <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                             
                             <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl shadow-xl bg-background rounded-full p-4 border-4 border-red-500/20">{challenge.icon}</div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">{challenge.title}</h3>
                                            <Badge variant="destructive" className="animate-pulse">Active Combat</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-destructive font-bold">
                                         <AlertTriangle className="w-4 h-4" /> 0 Strikes Allowed
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                     <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Progress</span>
                                            <span className="text-foreground">Day {challenge.daysCompleted} / {challenge.daysTotal}</span>
                                        </div>
                                        <Progress value={(challenge.daysCompleted / challenge.daysTotal) * 100} className="h-4 bg-red-100 dark:bg-red-950" indicatorClassName="bg-red-600" />
                                     </div>

                                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {challenge.rules.map((rule, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-medium border p-2 rounded bg-background/50">
                                                {i < 3 ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-muted-foreground" />}
                                                {rule}
                                            </div>
                                        ))}
                                     </div>
                                </div>

                                <div className="lg:col-span-1 flex flex-col justify-center space-y-3 border-l pl-6 border-red-500/10">
                                    <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20">
                                        Log Day {challenge.daysCompleted + 1}
                                    </Button>
                                    <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        I Failed Today
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">Last log: Today, 9:00 AM</p>
                                </div>
                             </div>
                        </Card>
                    ))}
                    
                    {/* PAST CHALLENGES */}
                    <div className="pt-8">
                         <h3 className="text-lg font-bold mb-4 opacity-70">Past Glories</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {challenges.filter(c => c.status === 'completed').map(challenge => (
                                <Card key={challenge.id} className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <div className="text-2xl grayscale">{challenge.icon}</div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">{challenge.title}</CardTitle>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">Ended Oct 31 • 100% Success</p>
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {/* BROWSE CHALLENGES */}
            {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
                    {challenges.filter(c => c.status === 'available').map(challenge => (
                        <Card key={challenge.id} className="group hover:border-primary transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-4xl shadow-sm rounded-xl p-2 bg-secondary/30">{challenge.icon}</div>
                                    <Badge variant="outline" className="uppercase tracking-wide">{challenge.daysTotal} Days</Badge>
                                </div>
                                <CardTitle className="text-xl">{challenge.title}</CardTitle>
                                <CardDescription>{challenge.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {challenge.rules.slice(0, 3).map((rule, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Lock className="w-3 h-3" /> {rule}
                                        </div>
                                    ))}
                                    {challenge.rules.length > 3 && (
                                        <div className="text-xs text-muted-foreground pl-5">+ {challenge.rules.length - 3} more rules</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <Users className="w-3 h-3" /> {challenge.participants.toLocaleString()} active contenders
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full gap-2">
                                    <Swords className="w-4 h-4" /> Enter Arena
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    
                    {/* Create Custom placeholder */}
                    <Card className="border-dashed flex flex-col items-center justify-center p-8 text-center space-y-4 hover:bg-secondary/10 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold">Design Custom Gauntlet</h3>
                        <p className="text-sm px-8">Create your own set of strict rules for a custom duration.</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
