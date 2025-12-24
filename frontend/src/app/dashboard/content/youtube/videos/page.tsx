'use client';

import { useContentStore, ContentItem } from '@/stores/contentStore';
import { useEffect, useState, useMemo } from 'react';
import { 
    Filter, Search, Plus, MoreHorizontal, Eye, 
    ThumbsUp, MessageSquare, Calendar, ChevronDown,
    LayoutList, LayoutGrid, FileText, CheckCircle2,
    BarChart3, Settings, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Reusing editor logic from previous file but adapted for drawer style
export default function VideosPage() {
    const { contents, fetchContents, createContent, updateContent, deleteContent } = useContentStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const youtubeContents = useMemo(() => 
        contents
            .filter(c => c.platform === 'youtube')
            .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
            .filter(c => statusFilter === 'all' || c.status === statusFilter)
    , [contents, search, statusFilter]);

    // Bulk Management
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === youtubeContents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(youtubeContents.map(c => c._id!)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} videos?`)) return;
        for (const id of Array.from(selectedIds)) {
            await deleteContent(id);
        }
        setSelectedIds(new Set());
        toast.success("Deleted selected videos");
    };

    const handleCreate = async () => {
        const newItem: Partial<ContentItem> = {
            title: 'Untitled Video',
            platform: 'youtube',
            type: 'video',
            status: 'idea',
            description: '',
            script: '',
            tasks: []
        };
        await createContent(newItem);
        toast.success("Created new draft");
    };

    return (
        <div className="flex flex-col h-full bg-background">
            
            {/* TOOLBAR */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4 flex-1">
                    <h1 className="font-bold text-lg">Channel Content</h1>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter" 
                                className="pl-9 h-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 border-dashed">
                                    <Filter className="w-4 h-4 mr-2" />
                                    {statusFilter === 'all' ? 'Filter' : statusFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {['all', 'idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'].map(s => (
                                    <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="capitalize">
                                        {s}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-4 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm border border-red-100">
                            <span className="font-medium">{selectedIds.size} selected</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-200" onClick={handleBulkDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                    </Button>
                </div>
            </div>

            {/* DATA TABLE HEADER */}
            <div className="grid grid-cols-[auto_3fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-6 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-16 z-10">
                <div className="w-10 flex items-center justify-center">
                    <Checkbox 
                        checked={selectedIds.size === youtubeContents.length && youtubeContents.length > 0}
                        onCheckedChange={toggleAll}
                    />
                </div>
                <div>Video</div>
                <div>Visibility</div>
                <div>Type</div>
                <div>Date</div>
                <div className="text-right">Stats</div>
                <div className="w-10"></div>
            </div>

            {/* CONTENT LIST */}
            <div className="flex-1 overflow-y-auto">
                {youtubeContents.map((video) => (
                    <div 
                        key={video._id} 
                        className={cn(
                            "grid grid-cols-[auto_3fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-6 py-4 border-b hover:bg-muted/30 transition-colors group items-center",
                            selectedIds.has(video._id!) && "bg-blue-50 dark:bg-blue-900/10"
                        )}
                        onClick={() => setEditingItem(video)}
                    >
                         {/* Selection */}
                         <div className="w-10 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                             <Checkbox 
                                checked={selectedIds.has(video._id!)}
                                onCheckedChange={() => toggleSelection(video._id!)}
                             />
                         </div>

                         {/* Video Info */}
                         <div className="flex items-start gap-4 cursor-pointer">
                             <div className="w-32 aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-md shrink-0 border relative flex items-center justify-center overflow-hidden">
                                 {/* Placeholder Thumbnail */}
                                 <div className="text-xs text-muted-foreground font-medium">No Image</div>
                             </div>
                             <div className="min-w-0 flex flex-col justify-center h-full space-y-1">
                                 <h4 className="font-medium truncate text-sm text-foreground group-hover:text-red-600 transition-colors pr-4">
                                     {video.title || 'Untitled Video'}
                                 </h4>
                                 <p className="text-xs text-muted-foreground line-clamp-2">
                                     {video.description || 'Add description...'}
                                 </p>
                             </div>
                         </div>

                         {/* Visibility */}
                         <div onClick={(e) => e.stopPropagation()}>
                             <Badge variant="outline" className={cn(
                                 "capitalize font-normal text-xs px-2 py-0.5 border-0",
                                 video.status === 'published' ? "bg-green-100 text-green-700" : 
                                 video.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                                 "bg-zinc-100 text-zinc-600"
                             )}>
                                 {video.status}
                             </Badge>
                         </div>

                         {/* Type */}
                         <div className="text-sm text-muted-foreground capitalize">
                             {video.type}
                         </div>

                         {/* Date */}
                         <div className="text-sm">
                             <div className="text-foreground">
                                 {video.scheduledDate ? format(new Date(video.scheduledDate), 'MMM d, yyyy') : 'No date'}
                             </div>
                             <div className="text-xs text-muted-foreground">
                                 {video.status === 'published' ? 'Published' : 'Scheduled'}
                             </div>
                         </div>

                         {/* Stats */}
                         <div className="text-right text-sm space-y-1">
                             <div className="text-foreground font-medium">
                                 {video.metrics?.views || '-'} <span className="text-xs text-muted-foreground font-normal">views</span>
                             </div>
                             <div className="text-xs text-muted-foreground">
                                 {video.metrics?.ctr || 0}% CTR
                             </div>
                         </div>

                         {/* Actions */}
                         <div className="w-10 flex justify-end" onClick={(e) => e.stopPropagation()}>
                             <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <MoreHorizontal className="w-4 h-4" />
                                     </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                     <DropdownMenuItem onClick={() => setEditingItem(video)}>
                                         <Edit className="w-4 h-4 mr-2" /> Edit Details
                                     </DropdownMenuItem>
                                     <DropdownMenuItem className="text-red-600" onClick={() => deleteContent(video._id!)}>
                                         <Trash2 className="w-4 h-4 mr-2" /> Delete
                                     </DropdownMenuItem>
                                 </DropdownMenuContent>
                             </DropdownMenu>
                         </div>
                    </div>
                ))}
            </div>

            {/* EDIT DRAWER */}
            {editingItem && (
                <ContentEditor 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                    onUpdate={(d) => editingItem._id && updateContent(editingItem._id, d)}
                />
            )}
        </div>
    );
}

// Reuse the Editor from previous step but refactor styling slightly for full height drawer feel
function ContentEditor({ item, onClose, onUpdate }: { item: ContentItem, onClose: () => void, onUpdate: (d: any) => void }) {
    // Simplified specific editor for this view
    return (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end" onClick={onClose}>
            <div className="w-[800px] h-full bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="h-14 border-b px-6 flex items-center justify-between bg-muted/10">
                    <h2 className="font-bold text-lg">Video Details</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" onClick={onClose} className="bg-red-600 hover:bg-red-700">Save</Button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label>Title (required)</Label>
                                <Input 
                                    className="font-medium text-lg" 
                                    value={item.title}
                                    onChange={e => onUpdate({ title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    className="min-h-[250px] resize-y" 
                                    placeholder="Tell viewers about your video"
                                    value={item.description || ''}
                                    onChange={e => onUpdate({ description: e.target.value })}
                                />
                            </div>

                            <div className="p-4 rounded-lg border bg-muted/20">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Checklist
                                </h3>
                                <div className="space-y-2">
                                    {item.tasks?.map((t, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Checkbox checked={t.isCompleted} onCheckedChange={(c) => {
                                                const nt = [...(item.tasks || [])];
                                                nt[i].isCompleted = !!c;
                                                onUpdate({ tasks: nt });
                                            }} />
                                            <Input 
                                                value={t.text} 
                                                className="h-8 text-sm"
                                                onChange={e => {
                                                    const nt = [...(item.tasks || [])];
                                                    nt[i].text = e.target.value;
                                                    onUpdate({ tasks: nt });
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
                                        const nt = [...(item.tasks || []), { id: crypto.randomUUID(), text: 'New Task', isCompleted: false }];
                                        onUpdate({ tasks: nt });
                                    }}>
                                        + Add Task
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg border flex items-center justify-center text-muted-foreground text-xs">
                                Thumbnail Preview
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <Select 
                                    value={item.status} 
                                    onValueChange={v => onUpdate({ status: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="idea">Private (Idea)</SelectItem>
                                        <SelectItem value="scripting">Scripting</SelectItem>
                                        <SelectItem value="filming">Filming</SelectItem>
                                        <SelectItem value="editing">Editing</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="published">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Schedule</Label>
                                <Input 
                                    type="date"
                                    value={item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : ''}
                                    onChange={e => onUpdate({ scheduledDate: new Date(e.target.value).toISOString() })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <div className="text-xs text-muted-foreground">
                                    Is this video made for kids? (Required)
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="kids-yes" /> <label htmlFor="kids-yes" className="text-sm">Yes</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="kids-no" defaultChecked /> <label htmlFor="kids-no" className="text-sm">No</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
