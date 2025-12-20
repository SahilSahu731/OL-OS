'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitNav } from '@/components/HabitNav';
import { User, Shield, Target, Award, Plus, ArrowRight, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Types
interface Identity {
    id: string;
    name: string;
    avatar: string;
    affirmation: string;
    strength: number; // 0-100
    color: string;
    evidence: string[]; // Habit IDs or descriptions
}

// Dummy Data
const DEFAULT_IDENTITIES: Identity[] = [
    {
        id: '1',
        name: 'The Athlete',
        avatar: '🏃‍♂️',
        affirmation: "I am the type of person who treats my body like a high-performance machine.",
        strength: 75,
        color: 'bg-emerald-500',
        evidence: ['Morning Run', 'Protein Intake', '8h Sleep']
    },
    {
        id: '2',
        name: 'The Founder',
        avatar: '🚀',
        affirmation: "I build systems that solve real problems.",
        strength: 40,
        color: 'bg-blue-600',
        evidence: ['Deep Work Block', 'Review KPIs', 'No Meeting Wednesdays']
    },
    {
        id: '3',
        name: 'The Stoic',
        avatar: '🏛️',
        affirmation: "I focus only on what I can control.",
        strength: 90,
        color: 'bg-stone-500',
        evidence: ['Journaling', 'Cold Shower', 'Meditation']
    }
];

export default function IdentityPage() {
    const [identities, setIdentities] = useState<Identity[]>(DEFAULT_IDENTITIES);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newIdentity, setNewIdentity] = useState<Partial<Identity>>({
        name: '',
        affirmation: 'I am the type of person who...',
        avatar: '👤',
        color: 'bg-zinc-500',
        strength: 0,
        evidence: []
    });

    const createIdentity = () => {
        if (!newIdentity.name) return;
        setIdentities([...identities, { 
            id: Math.random().toString(), 
            strength: 0,
            evidence: [],
            ...newIdentity 
        } as Identity]);
        setIsCreateOpen(false);
        setNewIdentity({ name: '', affirmation: 'I am the type of person who...', avatar: '👤', color: 'bg-zinc-500', strength: 0, evidence: [] });
    };

    return (
        <div className="space-y-8 min-h-screen pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <User className="w-8 h-8" /> Identity Architect
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Habits are the compound interest of self-improvement. Who do you wish to become?
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg"><Plus className="w-5 h-5 mr-2" /> New Avatar</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define New Identity</DialogTitle>
                            <DialogDescription>
                                Every action you take is a vote for the type of person you wish to become.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <label className="text-sm font-medium">Identity Name</label>
                                    <Input placeholder="e.g. The Writer" value={newIdentity.name} onChange={e => setNewIdentity({...newIdentity, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Avatar</label>
                                    <Input className="text-center text-2xl" maxLength={2} value={newIdentity.avatar} onChange={e => setNewIdentity({...newIdentity, avatar: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Core Affirmation</label>
                                <Textarea 
                                    className="resize-none" 
                                    placeholder="I am the type of person who..." 
                                    value={newIdentity.affirmation} 
                                    onChange={e => setNewIdentity({...newIdentity, affirmation: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={createIdentity}>Enshrine Identity</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <HabitNav />

            {/* MAIN IDENTITY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {identities.map((identity) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={identity.id}
                        className="group relative"
                    >
                        {/* Glow Effect */}
                        <div className={cn("absolute inset-0 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none -z-10", identity.color)} />
                        
                        <Card className="h-full border-t-4 shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderTopColor: identity.color.replace('bg-', '') }}>
                            <CardHeader className="relative pb-2">
                                <div className="absolute top-4 right-4 opacity-10 text-6xl select-none group-hover:opacity-20 transition-opacity">
                                    {identity.avatar}
                                </div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <span className="text-4xl shadow-sm rounded-full bg-secondary/50 p-2 w-16 h-16 flex items-center justify-center border">
                                        {identity.avatar}
                                    </span>
                                </CardTitle>
                                <div className="mt-4">
                                    <h3 className="text-xl font-bold">{identity.name}</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Affirmation Quote */}
                                <div className="relative">
                                    <span className="absolute -top-2 -left-2 text-4xl text-muted-foreground/20 serif font-serif">"</span>
                                    <p className="text-lg font-serif italic text-muted-foreground pl-4 leading-relaxed">
                                        {identity.affirmation}
                                    </p>
                                </div>

                                {/* Strength Meter */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Identity Strength</span>
                                        <span>{identity.strength}%</span>
                                    </div>
                                    <Progress value={identity.strength} className="h-2" />
                                </div>

                                {/* Evidence List */}
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Evidence</p>
                                    <div className="flex flex-wrap gap-2">
                                        {identity.evidence.map((ev, i) => (
                                            <div key={i} className="bg-secondary/50 px-3 py-1.5 rounded-md text-sm flex items-center gap-2 border">
                                                <Target className="w-3 h-3 text-muted-foreground" />
                                                {ev}
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary">
                                            + Link Habit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t bg-secondary/5">
                                <Button variant="ghost" className="w-full justify-between hover:bg-transparent hover:text-primary group-hover:translate-x-1 transition-transform">
                                    Review Votes <ArrowRight className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* INSIGHTS SECTION */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border p-8 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-background p-3 rounded-full border shadow-sm">
                        <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Atomic Insight</h3>
                        <p className="text-muted-foreground mt-1 max-w-3xl">
                            The most effective way to change your habits is not to focus on what you want to achieve, but on who you want to become. 
                            Your goal is not to read a book, the goal is to become a reader. 
                            Your goal is not to run a marathon, the goal is to become a runner.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
