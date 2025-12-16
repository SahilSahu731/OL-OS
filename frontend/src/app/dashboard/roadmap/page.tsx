'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Clock, AlertTriangle, ArrowRight, Zap, RefreshCw, Terminal, Layers, Hash } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}`;

export default function RoadmapPage() {
    const { token } = useAuthStore();
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ title: '', status: 'planned', priority: 'medium', type: 'feature' });
    const [isLoading, setIsLoading] = useState(false);

    const fetchRoadmap = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/roadmap`, { headers: { Authorization: `Bearer ${token}` } });
            setItems(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const addItem = async () => {
        if(!newItem.title) return;
        try {
           await axios.post(`${API_URL}/roadmap`, newItem, { headers: { Authorization: `Bearer ${token}` } });
           setNewItem({ ...newItem, title: '' });
           fetchRoadmap();
        } catch(e) { console.error(e); }
    };

    const updateStatus = async (id: string, status: string) => {
         try {
           setItems(items.map(i => i._id === id ? { ...i, status } : i)); // Optimistic update
           await axios.put(`${API_URL}/roadmap/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
           fetchRoadmap();
        } catch(e) { console.error(e); }
    };

    useEffect(() => { fetchRoadmap(); }, []);

    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getTypeIcon = (t: string) => {
        switch(t) {
             case 'bug': return <div className="w-1.5 h-1.5 rounded-full bg-red-500" />;
             case 'enhancement': return <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />;
             default: return <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />;
        }
    };

    const columns = [
        { id: 'planned', label: 'Protocol Queue', icon: Layers, color: 'text-zinc-400', bg: 'bg-zinc-50/50 dark:bg-zinc-900/30' },
        { id: 'in-progress', label: 'In Development', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/5' },
        { id: 'completed', label: 'System Integrated', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    ];

    return (
        <div className="space-y-8 pb-10 min-h-screen">
            
            {/* HERDER SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="space-y-2 z-10">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-400">
                        <Terminal className="w-3 h-3" /> SYSTEM_V2.0.4
                     </div>
                     <h1 className="text-4xl font-black tracking-tighter text-white">Development Roadmap</h1>
                     <p className="text-zinc-400 max-w-lg">
                        Manage OS upgrades. Prioritize features. Deploy protocols.
                     </p>
                </div>

                {/* ADD ITEM INPUT */}
                <div className="w-full md:w-auto z-10 bg-black/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 flex items-center gap-2 shadow-xl">
                    <div className="pl-3 text-zinc-500">
                        <Hash className="w-4 h-4" />
                    </div>
                    <Input 
                        placeholder="Initialize new protocol..." 
                        className="border-none shadow-none focus-visible:ring-0 bg-transparent text-white placeholder:text-zinc-600 min-w-[240px]"
                        value={newItem.title}
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    />
                    <div className="h-4 w-px bg-zinc-700" />
                    <Select value={newItem.type} onValueChange={(v) => setNewItem({...newItem, type: v})}>
                        <SelectTrigger className="w-[110px] h-8 text-xs bg-transparent border-none text-zinc-400 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="feature">Feature</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="enhancement">Enhancement</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={newItem.priority} onValueChange={(v) => setNewItem({...newItem, priority: v})}>
                        <SelectTrigger className="w-[100px] h-8 text-xs bg-transparent border-none text-zinc-400 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="icon" className="h-8 w-8 rounded-xl bg-white text-black hover:bg-zinc-200" onClick={addItem}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                {columns.map((col, idx) => (
                    <motion.div 
                        key={col.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`rounded-3xl p-4 min-h-[500px] border border-transparent ${col.bg}`}
                    >
                        {/* COLUMN HEADER */}
                        <div className="flex items-center justify-between mb-6 px-2">
                             <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${col.color}`}>
                                    <col.icon className="w-4 h-4" />
                                 </div>
                                 <span className="font-bold text-sm tracking-wide text-zinc-500 uppercase">{col.label}</span>
                             </div>
                             <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                                {items.filter(i => i.status === col.id).length}
                             </span>
                        </div>

                        {/* CARDS */}
                        <div className="space-y-3">
                            <AnimatePresence mode='popLayout'>
                                {items.filter(i => i.status === col.id).map(item => (
                                    <motion.div
                                        key={item._id}
                                        layoutId={item._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group"
                                    >
                                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden relative group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
                                                    {col.id !== 'completed' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 -mr-2 text-zinc-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => updateStatus(item._id, col.id === 'planned' ? 'in-progress' : 'completed')}
                                                        >
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(item.type)}
                                                    <span className="text-[10px] uppercase font-bold text-zinc-500">{item.type}</span>
                                                    <div className="flex-1" />
                                                    <Badge variant="outline" className={`text-[10px] uppercase border-0 px-1.5 py-0 ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                            
                                            {/* Progress Bar (Visual only) */}
                                            {col.id === 'in-progress' && (
                                                <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-1/2 animate-pulse" />
                                            )}
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {items.filter(i => i.status === col.id).length === 0 && (
                                <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <Layers className="w-4 h-4 opacity-50" />
                                    </div>
                                    <span className="text-xs uppercase font-bold tracking-widest">No Data</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
