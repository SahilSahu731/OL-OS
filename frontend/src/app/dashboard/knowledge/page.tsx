'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Share2, Plus, Brain, Filter } from 'lucide-react';

// MOCK DATA FOR SIMULATION
const INITIAL_NODES = [
    { id: 1, label: 'React.js', type: 'tech', x: 50, y: 50 },
    { id: 2, label: 'Next.js', type: 'tech', x: 60, y: 45 },
    { id: 3, label: 'Frontend Arch', type: 'concept', x: 55, y: 60 },
    { id: 4, label: 'UI Library', type: 'project', x: 40, y: 55 },
    { id: 5, label: 'Productivity', type: 'concept', x: 70, y: 30 },
    { id: 6, label: 'Zettelkasten', type: 'method', x: 75, y: 35 },
    { id: 7, label: 'Obsidian', type: 'tool', x: 72, y: 25 },
    { id: 8, label: 'Fitness', type: 'area', x: 20, y: 80 },
    { id: 9, label: 'Hypertrophy', type: 'concept', x: 25, y: 85 },
    { id: 10, label: 'Nutrition', type: 'concept', x: 15, y: 75 },
    { id: 11, label: 'OL-OS', type: 'project', x: 50, y: 50 }, // Central
];

const INITIAL_LINKS = [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 2, target: 11 },
    { source: 5, target: 6 },
    { source: 6, target: 7 },
    { source: 8, target: 9 },
    { source: 8, target: 10 },
    { source: 5, target: 11 },
    { source: 8, target: 11 },
];

export default function KnowledgeBase() {
    const [search, setSearch] = useState('');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    // Simple visual simulation of a graph
    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Neural Network
                     </h1>
                     <p className="text-muted-foreground">Second Brain Knowledge Graph</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                         <Input 
                            placeholder="Search nodes..." 
                            className="pl-9 bg-background/50 border-zinc-700/50 backdrop-blur-sm" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                         />
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold"><Plus className="w-4 h-4 mr-2" /> New Node</Button>
                </div>
            </div>

            {/* MAIN VIEW */}
            <Card className="flex-1 border-zinc-800 bg-black/80 backdrop-blur-xl overflow-hidden relative group">
                
                {/* GRID BG */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

                {/* GRAPH VISUALIZATION (SIMULATED) */}
                <div className="w-full h-full relative">
                    {/* Render Links */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {INITIAL_LINKS.map((link, i) => {
                            const start = INITIAL_NODES.find(n => n.id === link.source);
                            const end = INITIAL_NODES.find(n => n.id === link.target);
                            if(!start || !end) return null;
                            return (
                                <motion.line
                                    key={i}
                                    x1={`${start.x}%`} y1={`${start.y}%`}
                                    x2={`${end.x}%`} y2={`${end.y}%`}
                                    stroke="currentColor"
                                    className="text-zinc-800"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Render Nodes */}
                    {INITIAL_NODES.map((node) => (
                        <motion.div
                            key={node.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setSelectedNode(node.id)}
                        >
                            <div className={`
                                w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] border border-white/20
                                ${node.id === 11 ? 'bg-white w-6 h-6 animate-pulse' : ''}
                                ${node.type === 'tech' ? 'bg-blue-500 text-blue-500' : ''}
                                ${node.type === 'concept' ? 'bg-purple-500 text-purple-500' : ''}
                                ${node.type === 'project' && node.id !== 11 ? 'bg-green-500 text-green-500' : ''}
                                ${node.type === 'area' ? 'bg-red-500 text-red-500' : ''}
                                ${['tool','method'].includes(node.type) ? 'bg-amber-500 text-amber-500' : ''}
                             `} />
                            
                            {/* Label */}
                            <div className={`
                                absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10 text-zinc-300 pointer-events-none
                                ${node.id === selectedNode ? 'opacity-100 scale-110 !border-indigo-500 text-white' : 'opacity-60 group-hover:opacity-100 transition-opacity'}
                            `}>
                                {node.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* INSPECTOR PANEL (Overlay) */}
                {selectedNode && (
                    <motion.div 
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-4 right-4 w-72 bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl z-20 shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white">{INITIAL_NODES.find(n => n.id === selectedNode)?.label}</h3>
                                <Badge variant="outline" className="text-[10px] uppercase">{INITIAL_NODES.find(n => n.id === selectedNode)?.type}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}>×</Button>
                        </div>
                        <div className="space-y-3 text-sm text-zinc-400">
                             <p>Connected to {INITIAL_LINKS.filter(l => l.source === selectedNode || l.target === selectedNode).length} other nodes.</p>
                             <div className="h-px bg-zinc-800" />
                             <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/50 font-mono text-xs">
                                 # Synapses: High <br/>
                                 # Last Access: Recently
                             </div>
                             <Button size="sm" className="w-full bg-white text-black hover:bg-zinc-200">Open File</Button>
                        </div>
                    </motion.div>
                )}

                {/* CONTROLS */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                     <Button variant="outline" size="sm" className="bg-black/50 border-zinc-800 backdrop-blur-md text-zinc-400 hover:text-white"><Filter className="w-3 h-3 mr-2" /> Filter</Button>
                     <Button variant="outline" size="sm" className="bg-black/50 border-zinc-800 backdrop-blur-md text-zinc-400 hover:text-white"><Share2 className="w-3 h-3 mr-2" /> Export Graph</Button>
                     <div className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-zinc-800 rounded-md backdrop-blur-md text-xs text-zinc-500">
                         <span className="w-2 h-2 rounded-full bg-blue-500" /> Tech
                         <span className="w-2 h-2 rounded-full bg-purple-500 ml-2" /> Concept
                         <span className="w-2 h-2 rounded-full bg-green-500 ml-2" /> Project
                         <span className="w-2 h-2 rounded-full bg-red-500 ml-2" /> Area
                     </div>
                </div>

            </Card>
        </div>
    );
}
