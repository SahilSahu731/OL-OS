'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContentStore, ContentItem } from '@/stores/contentStore';
import { useEffect, useState, useMemo } from 'react';
import { 
    Lightbulb, FileText, Camera, Scissors, Search, Image as ImageIcon, Upload, 
    ArrowLeft, Save, Plus, X, ExternalLink, CheckSquare, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ScriptEditor } from '@/components/ScriptEditor';

export default function ProjectWorkspace() {
    const { id } = useParams();
    const router = useRouter();
    const { contents, fetchContents, updateContent } = useContentStore();
    const [activeTab, setActiveTab] = useState('idea');

    useEffect(() => {
        if (!contents.length) fetchContents();
    }, [fetchContents, contents.length]);

    const project = useMemo(() => contents.find(c => c._id === id), [contents, id]);

    // Metadata Effect
    useEffect(() => {
        if (project) {
            const phaseLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
            document.title = `${phaseLabel} | ${project.title} - OL-OS Studio`;
        }
    }, [project, activeTab]);

    if (!project) return <div className="p-12 text-center">Loading Project...</div>;

    const handleUpdate = (data: Partial<ContentItem>) => {
        if (project._id) updateContent(project._id, data);
    };

    // --- SUB-COMPONENTS FOR PHASES ---

    const PhaseIdea = () => {
        const [newLinkTitle, setNewLinkTitle] = useState('');
        const [newLinkUrl, setNewLinkUrl] = useState('');

        const addLink = () => {
            if (!newLinkTitle || !newLinkUrl) return;
            const currentLinks = project.researchLinks || [];
            handleUpdate({ researchLinks: [...currentLinks, { title: newLinkTitle, url: newLinkUrl }] });
            setNewLinkTitle('');
            setNewLinkUrl('');
        };

        const removeLink = (idx: number) => {
            const currentLinks = project.researchLinks || [];
            handleUpdate({ researchLinks: currentLinks.filter((_, i) => i !== idx) });
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-lg">Core Concept</Label>
                        <Textarea 
                            className="min-h-[150px] text-lg bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                            placeholder="What is the main idea? Why does it matter?"
                            value={project.description || ''}
                            onChange={e => handleUpdate({ description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-lg">Research Notes</Label>
                        <Textarea 
                            className="min-h-[300px] font-mono text-sm"
                            placeholder="- Key Stat: ...&#10;- Quote: ...&#10;- Structure Idea: ..."
                            value={project.researchNotes || ''}
                            onChange={e => handleUpdate({ researchNotes: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" /> Research Links
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Title" 
                                    value={newLinkTitle}
                                    onChange={e => setNewLinkTitle(e.target.value)}
                                />
                                <Input 
                                    placeholder="URL" 
                                    value={newLinkUrl}
                                    onChange={e => setNewLinkUrl(e.target.value)}
                                />
                                <Button onClick={addLink} size="icon"><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="space-y-2">
                                {project.researchLinks?.map((link, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md border text-sm group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline truncate text-blue-600 dark:text-blue-400">
                                                {link.title}
                                            </a>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-50" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeLink(i)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {(!project.researchLinks || project.researchLinks.length === 0) && (
                                    <div className="text-xs text-muted-foreground text-center py-4">No links added</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Inspiration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                placeholder="Paste links to similar videos, style refs, or creators..."
                                className="min-h-[100px]"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const PhaseScript = () => {
        // Local state for editing to prevent API spam
        const [localScript, setLocalScript] = useState(project.script || '');
        const [localTitle, setLocalTitle] = useState(project.title || '');
        const [isDirty, setIsDirty] = useState(false);

        // Sync local state when project changes (handle external updates or initial load)
        useEffect(() => {
            if (!isDirty) {
                setLocalScript(project.script || '');
                setLocalTitle(project.title || '');
            }
        }, [project.script, project.title, isDirty]);

        const wordCount = (localScript || '').replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length;
        const readTime = Math.ceil(wordCount / 150); 

        const handleSave = () => {
             handleUpdate({ script: localScript, title: localTitle });
             setIsDirty(false);
             toast.success("Script saved successfully");
        };

        // Handle Ctrl+S
        useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    handleSave();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [localScript, localTitle]); // eslint-disable-line react-hooks/exhaustive-deps

        return (
            <div className="h-full flex flex-col bg-background animate-in fade-in duration-500">
                {/* TOOLBAR with SAVE BUTTON */}
                <div className="h-14 border-b flex items-center justify-between px-6 bg-background flex-shrink-0 z-10 box-border sticky top-0">
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={handleSave} 
                            disabled={!isDirty}
                            className={cn("gap-2 transition-all", isDirty ? "bg-red-600 hover:bg-red-700 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                        >
                            <Save className="w-4 h-4" />
                            {isDirty ? 'Save Changes' : 'Saved'}
                        </Button>
                        {isDirty && <span className="text-xs text-muted-foreground animate-pulse">Unsaved changes...</span>}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {wordCount} words</span>
                        <div className="w-px h-3 bg-border" />
                        <span className="flex items-center gap-1.5"><CheckSquare className="w-3 h-3" /> ~{readTime} min read</span>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-row">
                    <div className="flex-1 overflow-y-auto w-full">
                         <div className="max-w-4xl mx-auto px-12 md:px-24 pt-12 pb-32">
                            {/* NOTION-LIKE HEADER */}
                            <div className="h-48 group relative flex-shrink-0 mb-8 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-dashed border-muted-foreground/20 flex items-center justify-center">
                                 <div className="text-4xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                                      🎬
                                 </div>
                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button variant="ghost" size="sm" className="h-8 text-xs">Change Cover</Button>
                                 </div>
                            </div>

                            {/* TITLE AREA */}
                            <div className="mb-8 group">
                                <Input 
                                    className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40" 
                                    value={localTitle}
                                    onChange={e => { setLocalTitle(e.target.value); setIsDirty(true); }}
                                    placeholder="Untitled Project"
                                />
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 border-b pb-4 opacity-50 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-normal text-xs rounded-md px-1 py-0 h-5">Status</Badge>
                                        <span className="capitalize">{project.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-normal text-xs rounded-md px-1 py-0 h-5">Created</Badge>
                                        <span>{new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* THE EDITOR */}
                            <div className="min-h-[500px]">
                                <ScriptEditor 
                                    content={localScript} 
                                    onChange={(html: string) => { setLocalScript(html); setIsDirty(true); }}
                                />
                            </div>
                         </div>
                    </div>

                    {/* SLIM SIDEBAR (Notion Style) */}
                    <div className="w-72 border-l bg-background flex-shrink-0 flex flex-col pt-12 hidden xl:flex">
                        <div className="px-4 mb-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Research & Context</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground">Scratchpad</Label>
                                        <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" onClick={() => handleUpdate({ researchNotes: project.researchNotes + '\n' })}><Plus className="w-3 h-3" /></Button>
                                    </div>
                                    <Textarea 
                                        className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md min-h-[150px] border whitespace-pre-wrap resize-none focus-visible:ring-0"
                                        value={project.researchNotes || ''}
                                        onChange={e => handleUpdate({ researchNotes: e.target.value })}
                                        placeholder="Add quick notes here..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Links</Label>
                                    <div className="space-y-1">
                                         {project.researchLinks?.map((l, i) => (
                                            <a key={i} href={l.url} target="_blank" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline truncate py-1">
                                                {l.title}
                                            </a>
                                        ))}
                                         {(!project.researchLinks || project.researchLinks.length === 0) && (
                                            <div className="text-xs text-muted-foreground italic">No links.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PhaseChecklist = ({ phase }: { phase: string }) => {
        const [newTask, setNewTask] = useState('');
        
        const tasks = project.tasks?.filter(t => t.phase === phase) || [];

        const addTask = () => {
             if (!newTask) return;
             const allTasks = project.tasks || [];
             handleUpdate({ tasks: [...allTasks, { id: crypto.randomUUID(), text: newTask, isCompleted: false, phase }] });
             setNewTask('');
        };

        const toggleTask = (taskId: string) => {
            const allTasks = [...(project.tasks || [])];
            const t = allTasks.find(t => t.id === taskId);
            if (t) {
                t.isCompleted = !t.isCompleted;
                handleUpdate({ tasks: allTasks });
            }
        };

        const deleteTask = (taskId: string) => {
            const allTasks = project.tasks || [];
            handleUpdate({ tasks: allTasks.filter(t => t.id !== taskId) });
        };

        return (
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Input 
                        placeholder={`Add item to ${phase} checklist...`}
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                        className="h-12 text-lg"
                    />
                    <Button size="lg" onClick={addTask}>Add Item</Button>
                </div>

                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-4 bg-muted/20 border rounded-xl hover:bg-muted/40 transition-colors group">
                             <Checkbox 
                                id={task.id} 
                                checked={task.isCompleted} 
                                onCheckedChange={() => toggleTask(task.id)}
                                className="w-6 h-6 rounded-md"
                             />
                             <label 
                                htmlFor={task.id} 
                                className={cn(
                                    "flex-1 text-lg cursor-pointer select-none transition-all",
                                    task.isCompleted && "text-muted-foreground line-through decoration-muted-foreground/50"
                                )}
                             >
                                 {task.text}
                             </label>
                             <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500" onClick={() => deleteTask(task.id)}>
                                 <X className="w-4 h-4" />
                             </Button>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            All clear! Add steps to track your {phase} process.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const PhaseSEO = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <Label className="text-lg">Video Title</Label>
                <div className="relative">
                    <Input 
                        value={project.title} 
                        onChange={e => handleUpdate({ title: e.target.value })} 
                        className="text-xl h-14 font-bold pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        {project.title.length}/100
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                         value={project.description || ''}
                         onChange={e => handleUpdate({ description: e.target.value })}
                         className="min-h-[300px]"
                    />
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <Textarea 
                            placeholder="tech, coding, tutorial..."
                        />
                    </div>
                    <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                        <CardHeader><CardTitle className="text-sm text-blue-700 dark:text-blue-400">SEO Preview</CardTitle></CardHeader>
                        <CardContent>
                             <div className="flex gap-3">
                                 <div className="w-32 aspect-video bg-zinc-200 dark:bg-zinc-800 rounded mb-1 shrink-0" />
                                 <div className="space-y-1 min-w-0">
                                     <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{project.title}</div>
                                     <div className="text-xs text-muted-foreground">OL-OS • 0 views • Just now</div>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    const PhaseUpload = () => (
        <div className="max-w-2xl mx-auto text-center space-y-8 pt-12">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Ready to Launch?</h2>
                <p className="text-muted-foreground">Review your checklist before publishing.</p>
            </div>

            <Card>
                <CardContent className="p-6 text-left space-y-2">
                    <div className="flex items-center justify-between">
                         <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Script</span>
                         <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ready</Badge>
                    </div>
                     <div className="flex items-center justify-between">
                         <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> Filming</span>
                         <span className="text-sm text-muted-foreground">{project.tasks?.filter(t => t.phase === 'filming' && t.isCompleted).length}/{project.tasks?.filter(t => t.phase === 'filming').length} tasks</span>
                    </div>
                </CardContent>
            </Card>

            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg" onClick={() => {
                handleUpdate({ status: 'published', publishedDate: new Date().toISOString() });
                toast.success("Video Published!");
                router.push('/dashboard/content/youtube');
            }}>
                <Upload className="w-5 h-5 mr-2" /> Mark as Published
            </Button>
            
            <p className="text-xs text-muted-foreground">This will move the project to your "Published" library.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* TOP NAVIGATION (MATCHING HABIT NAV STYLE) */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <Input 
                            value={project.title}
                            onChange={e => handleUpdate({ title: e.target.value })}
                            className="h-8 text-lg font-bold border-none shadow-none px-0 focus-visible:ring-0 w-[400px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'published' ? 'default' : 'outline'} className="capitalize">
                        {project.status}
                    </Badge>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); }} className="h-full flex flex-col">
                    <div className="border-b px-8 py-1 flex-shrink-0 bg-background">
                        <TabsList className="h-auto p-0 gap-6 bg-transparent w-auto justify-center rounded-md">
                            {[
                                { id: 'idea', label: 'Idea & Research', icon: Lightbulb },
                                { id: 'script', label: 'Scripting', icon: FileText },
                                { id: 'filming', label: 'Filming', icon: Camera },
                                { id: 'editing', label: 'Editing', icon: Scissors },
                                { id: 'seo', label: 'SEO & Pack', icon: Search },
                                { id: 'upload', label: 'Publish', icon: Upload },
                            ].map(tab => (
                                <TabsTrigger 
                                    key={tab.id}
                                    value={tab.id} 
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none hover:text-foreground hover:bg-transparent"
                                >
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden bg-muted/5">
                        <TabsContent value="idea" className="mt-0 h-full overflow-y-auto p-8">
                            <PhaseIdea />
                        </TabsContent>
                        <TabsContent value="script" className="mt-0 h-full overflow-hidden">
                            <PhaseScript />
                        </TabsContent>
                        <TabsContent value="filming" className="mt-0 h-full overflow-y-auto p-8">
                            <PhaseChecklist phase="filming" />
                        </TabsContent>
                        <TabsContent value="editing" className="mt-0 h-full overflow-y-auto p-8">
                            <PhaseChecklist phase="editing" />
                        </TabsContent>
                        <TabsContent value="seo" className="mt-0 h-full overflow-y-auto p-8">
                            <PhaseSEO />
                        </TabsContent>
                        <TabsContent value="upload" className="mt-0 h-full overflow-y-auto p-8">
                            <PhaseUpload />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
