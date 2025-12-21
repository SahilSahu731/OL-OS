'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, GripVertical, Trash2, Edit2, AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type RoadmapStatus = 'planned' | 'in-progress' | 'completed' | 'icebox';
type RoadmapPriority = 'low' | 'medium' | 'high' | 'critical';
type RoadmapType = 'feature' | 'bug' | 'enhancement';

interface RoadmapItem {
    _id: string;
    title: string;
    description?: string;
    status: RoadmapStatus;
    priority: RoadmapPriority;
    type: RoadmapType;
    createdAt: string;
}

const COLUMNS: { id: RoadmapStatus; label: string; color: string }[] = [
    { id: 'planned', label: 'Planned', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { id: 'completed', label: 'Completed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { id: 'icebox', label: 'Icebox', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' }
];

const PRIORITY_COLORS = {
    low: 'text-zinc-400 bg-zinc-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    high: 'text-amber-400 bg-amber-400/10',
    critical: 'text-red-400 bg-red-400/10'
};

const TYPE_ICONS = {
    feature: Circle,
    bug: AlertCircle,
    enhancement: Clock // Using Clock as placeholder or maybe Zap
};

export default function RoadmapPage() {
    const [items, setItems] = useState<RoadmapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as RoadmapPriority,
        type: 'feature' as RoadmapType,
        status: 'planned' as RoadmapStatus
    });

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/roadmap');
            setItems(data);
        } catch (error) {
            toast.error("Failed to fetch roadmap");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title.trim()) return;
        try {
            const { data } = await api.post('/roadmap', formData);
            setItems([...items, data]);
            toast.success("Feature added to roadmap");
            setIsCreateOpen(false);
            setFormData({ title: '', description: '', priority: 'medium', type: 'feature', status: 'planned' });
        } catch (error) {
            toast.error("Failed to create item");
        }
    };

    const handleUpdate = async (id: string, updates: Partial<RoadmapItem>) => {
        // Optimistic update
        const oldItems = [...items];
        setItems(items.map(i => i._id === id ? { ...i, ...updates } : i));

        try {
            await api.put(`/roadmap/${id}`, updates);
        } catch (error) {
            setItems(oldItems); // Revert
            toast.error("Failed to update item");
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic delete
        const oldItems = [...items];
        setItems(items.filter(i => i._id !== id));
        
        try {
            await api.delete(`/roadmap/${id}`);
            toast.success("Item removed");
            setEditingItem(null);
        } catch (error) {
            setItems(oldItems);
            toast.error("Failed to delete item");
        }
    };

    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as RoadmapStatus;
        handleUpdate(draggableId, { status: newStatus });
    };

    const openEdit = (item: RoadmapItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            priority: item.priority,
            type: item.type,
            status: item.status
        });
    };

    const saveEdit = async () => {
        if (!editingItem) return;
        try {
            await api.put(`/roadmap/${editingItem._id}`, formData);
            setItems(items.map(i => i._id === editingItem._id ? { ...i, ...formData } : i));
            toast.success("Item updated");
            setEditingItem(null);
        } catch (error) {
            toast.error("Failed to save changes");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] animate-in fade-in duration-500 overflow-hidden">
             
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <GripVertical className="w-8 h-8 text-primary" />
                        System Architecture
                    </h1>
                    <p className="text-muted-foreground">Manage development cycles and feature pipeline.</p>
                </div>
                <Button onClick={() => { setFormData({ title: '', description: '', priority: 'medium', type: 'feature', status: 'planned' }); setIsCreateOpen(true); }} className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> New Feature
                </Button>
            </div>

            {/* KANBAN BOARD */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full gap-6 min-w-[1000px] pb-4">
                        {COLUMNS.map(column => (
                            <div key={column.id} className="flex-1 flex flex-col min-w-[280px] bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl overflow-hidden">
                                
                                {/* Column Header */}
                                <div className={cn("p-4 border-b flex justify-between items-center bg-zinc-900/50", column.color.split(' ')[2])}>
                                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                                        <div className={cn("w-2 h-2 rounded-full", column.color.split(' ')[1].replace('text-', 'bg-'))} />
                                        {column.label}
                                    </div>
                                    <Badge variant="outline" className="bg-black/20 border-white/10 text-muted-foreground">
                                        {items.filter(i => i.status === column.id).length}
                                    </Badge>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <ScrollArea className="flex-1 p-3">
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn("space-y-3 min-h-[100px] transition-colors rounded-xl", snapshot.isDraggingOver ? "bg-primary/5" : "")}
                                            >
                                                {items.filter(i => i.status === column.id).map((item, index) => (
                                                    <Draggable key={item._id} draggableId={item._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => openEdit(item)}
                                                                style={{ ...provided.draggableProps.style }}
                                                                className={cn(
                                                                    "group relative bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md",
                                                                    snapshot.isDragging ? "rotate-2 scale-105 z-50 border-primary shadow-2xl ring-1 ring-primary" : ""
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <Badge variant="secondary" className={cn("text-[10px] uppercase px-1.5 py-0.5 h-auto font-bold border-0", PRIORITY_COLORS[item.priority])}>
                                                                        {item.priority}
                                                                    </Badge>
                                                                    {item.type === 'bug' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                                                    {item.type === 'feature' && <Circle className="w-3 h-3 text-blue-500" />}
                                                                    {item.type === 'enhancement' && <Clock className="w-3 h-3 text-emerald-500" />}
                                                                </div>
                                                                
                                                                <h3 className="text-sm font-bold text-zinc-200 leading-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                                                
                                                                {item.description && (
                                                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{item.description}</p>
                                                                )}

                                                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800/50">
                                                                    <span className="text-[10px] text-zinc-600 font-mono">
                                                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-500 hover:text-white" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
                                                                            <Edit2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {/* CREATE DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add to Pipeline</DialogTitle>
                        <DialogDescription>Create a new task for the development roadmap.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Title</label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Feature name..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Status</label>
                                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="icebox">Icebox</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Priority</label>
                                <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Type</label>
                            <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feature">Feature</SelectItem>
                                    <SelectItem value="bug">Bug</SelectItem>
                                    <SelectItem value="enhancement">Enhancement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Description</label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                   <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Title</label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Status</label>
                                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="icebox">Icebox</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Priority</label>
                                    <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Type</label>
                                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="feature">Feature</SelectItem>
                                        <SelectItem value="bug">Bug</SelectItem>
                                        <SelectItem value="enhancement">Enhancement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Description</label>
                                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex justify-between sm:justify-between">
                         <Button variant="destructive" onClick={() => editingItem && handleDelete(editingItem._id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                             <Button onClick={saveEdit}>Save Changes</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
