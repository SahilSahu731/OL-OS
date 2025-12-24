'use client';

import { useContentStore, ContentItem } from '@/stores/contentStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Plus, ArrowRight, Lightbulb, Sparkles, MoreHorizontal, 
    Trash2, Palette, Zap 
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Assuming you have this utility

export default function IdeasPage() {
    const { contents, createContent, deleteContent } = useContentStore();
    const [quickTitle, setQuickTitle] = useState('');
    const router = useRouter();

    useEffect(() => {
        document.title = "Idea Reactor | OL-OS Studio";
    }, []);

    const ideas = contents.filter(c => c.platform === 'youtube' && c.status === 'idea');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) return;
        
        await createContent({
            title: quickTitle,
            platform: 'youtube', // Fixed platform
            type: 'video', // Fixed type
            status: 'idea',
            description: '',
            tasks: [],
            researchLinks: []
        });
        setQuickTitle('');
        toast.success("Idea Captured");
    };

    const handleDevelop = (id: string) => {
        router.push(`/dashboard/content/youtube/project/${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* HEADER */}
            <div className="h-20 border-b flex items-center justify-between px-8 bg-muted/10 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                        Idea Reactor
                    </h1>
                    <p className="text-muted-foreground text-sm">Review, refine, and graduate your concepts.</p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span>{ideas.length} IDEAS IN BANK</span>
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="shrink-0 p-8 flex justify-center bg-background/50 backdrop-blur-xl sticky top-0 z-10 border-b">
                 <form onSubmit={handleAdd} className="w-full max-w-2xl relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Zap className="w-5 h-5 text-amber-500 transition-colors group-focus-within:text-amber-600" />
                    </div>
                    <Input 
                        value={quickTitle}
                        onChange={e => setQuickTitle(e.target.value)}
                        placeholder="Spark a new video idea..." 
                        className="pl-12 h-14 text-lg bg-white dark:bg-zinc-900 shadow-xl border-amber-500/20 focus-visible:ring-amber-500/50 rounded-2xl"
                        autoFocus
                    />
                    <Button 
                        size="icon" 
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                        disabled={!quickTitle.trim()}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </form>
            </div>

            {/* MASONRY GRID */}
            <div className="flex-1 overflow-y-auto p-8">
                {ideas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                            <Lightbulb className="w-10 h-10 opacity-20" />
                        </div>
                        <p>The reactor is cold. Add a spark above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start pb-20">
                        {ideas.map((idea) => (
                            <IdeaCard 
                                key={idea._id} 
                                idea={idea} 
                                onDevelop={() => idea._id && handleDevelop(idea._id)}
                                onDelete={() => idea._id && deleteContent(idea._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function IdeaCard({ idea, onDevelop, onDelete }: { idea: ContentItem, onDevelop: () => void, onDelete: () => void }) {
    return (
        <Card className="group relative overflow-hidden border-muted/60 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
             {/* Gradient Accent */}
             <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between space-y-0">
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-transparent text-[10px] font-bold tracking-wider">
                    NEW IDEA
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Discard Idea
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            
            <CardContent className="p-5 pt-2 space-y-3">
                <h3 
                    className="font-bold text-lg leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer"
                    onClick={onDevelop}
                >
                    {idea.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {idea.description || 'No details yet. Click to expand.'}
                </p>
                {/* Visual placeholder for tags */}
                <div className="flex flex-wrap gap-1 pt-2 opacity-50 text-[10px]">
                    <span className="bg-muted px-1.5 py-0.5 rounded">#concept</span>
                </div>
            </CardContent>

            <CardFooter className="p-2 bg-muted/10 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="sm" className="text-xs h-8 ml-auto text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={onDevelop}>
                    Open Project <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </CardFooter>
        </Card>
    )
}
