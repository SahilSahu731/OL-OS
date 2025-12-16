'use client';

import { useEffect, useState } from 'react';
import { useNoteStore, Note } from '@/stores/noteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Pin, PinOff, Inbox, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function VaultPage() {
  const { notes, fetchNotes, createNote, updateNote, deleteNote } = useNoteStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6 h-full flex flex-col">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
               <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                   <Inbox className="w-8 h-8" /> The Vault
               </h1>
               <p className="text-muted-foreground">Second Brain & Chaos Storage</p>
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search thoughts..." 
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>
                <div className="flex border rounded-md p-1 bg-muted/50">
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                </div>
                <Button onClick={() => { setEditingNote(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Entry
                </Button>
           </div>
       </div>

       {/* CONTENT */}
       <div className="flex-1 overflow-y-auto space-y-8 pb-10">
            
            {/* PINNED (If Any) */}
            {pinnedNotes.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Pin className="w-4 h-4" /> Pinned
                    </h3>
                    <div className={cn("grid gap-4", view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
                        {pinnedNotes.map(note => (
                            <NoteCard 
                                key={note._id} 
                                note={note} 
                                onClick={() => { setEditingNote(note); setIsDialogOpen(true); }}
                                onDelete={() => deleteNote(note._id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* OTHERS */}
            <div className="space-y-4">
                {pinnedNotes.length > 0 && (
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Everything Else</h3>
                )}
                <div className={cn("grid gap-4", view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
                    {otherNotes.map(note => (
                        <NoteCard 
                            key={note._id} 
                            note={note} 
                            onClick={() => { setEditingNote(note); setIsDialogOpen(true); }}
                            onDelete={() => deleteNote(note._id)}
                        />
                    ))}
                    {otherNotes.length === 0 && pinnedNotes.length === 0 && (
                         <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                             <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
                             <p>The Vault is empty.</p>
                             <p className="text-sm">Capture your first thought now.</p>
                         </div>
                    )}
                </div>
            </div>
       </div>

       <NoteDialog 
           open={isDialogOpen} 
           onOpenChange={setIsDialogOpen} 
           initialNote={editingNote}
           onSave={async (data) => {
               if (editingNote) {
                   await updateNote(editingNote._id, data);
               } else {
                   await createNote(data);
               }
               setIsDialogOpen(false);
           }}
       />
    </div>
  );
}

function NoteCard({ note, onClick, onDelete }: { note: Note, onClick: () => void, onDelete: () => void }) {
    return (
        <Card className="group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden" onClick={onClick}>
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold line-clamp-1">{note.title}</h3>
                    {note.isPinned && <Pin className="w-3 h-3 text-primary rotate-45 shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4rem] whitespace-pre-wrap">
                    {note.content || "No content"}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-muted-foreground">{format(new Date(note.updatedAt), 'MMM d')}</span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function NoteDialog({ open, onOpenChange, initialNote, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, initialNote: Note | null, onSave: (data: any) => Promise<void> }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        if (open) {
            setTitle(initialNote?.title || '');
            setContent(initialNote?.content || '');
            setIsPinned(initialNote?.isPinned || false);
        }
    }, [open, initialNote]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                         <Input 
                             value={title} 
                             onChange={(e) => setTitle(e.target.value)} 
                             className="text-xl font-bold border-none focus-visible:ring-0 px-0 h-auto" 
                             placeholder="Untitled Note"
                         />
                         <Button 
                             variant="ghost" 
                             size="icon" 
                             className={cn("shrink-0", isPinned ? "text-primary" : "text-muted-foreground")}
                             onClick={() => setIsPinned(!isPinned)}
                         >
                             <Pin className="w-4 h-4" />
                         </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 min-h-[300px]">
                    <Textarea 
                         value={content} 
                         onChange={(e) => setContent(e.target.value)} 
                         className="h-full resize-none border-none focus-visible:ring-0 px-0 text-base" 
                         placeholder="Start typing..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => onSave({ title, content, isPinned })}>Save Note</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
