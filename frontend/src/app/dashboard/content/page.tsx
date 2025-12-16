'use client';

import { useEffect, useState } from 'react';
import { useContentStore, ContentItem } from '@/stores/contentStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Twitter, Instagram, Youtube, Calendar, MoreHorizontal, PenTool, LayoutTemplate, Film, Image as ImageIcon, Clock, Hash, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ContentPage() {
  const { contents, fetchContents, createContent, updateContent, deleteContent, isLoading } = useContentStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    title: '',
    platform: 'twitter',
    type: 'tweet',
    status: 'idea',
    description: '',
    script: ''
  });

  // Twitter specific state
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [tweetDraft, setTweetDraft] = useState('');
  const [isThreadMode, setIsThreadMode] = useState(false);

  useEffect(() => {
    fetchContents();
    // Check if twitter token exists (mock)
    const storedTwitter = localStorage.getItem('twitter_connected');
    if (storedTwitter) setIsTwitterConnected(true);
  }, [fetchContents]);

  const handleCreate = async () => {
    if (!formData.title) {
        toast.error("Title is required");
        return;
    }
    await createContent(formData);
    setFormData({ title: '', platform: 'twitter', type: 'tweet', status: 'idea', description: '', script: '' });
    setIsDialogOpen(false);
    toast.success("Content Idea Created");
  };

  const handleConnectTwitter = () => {
      // Mock OAuth flow
      localStorage.setItem('twitter_connected', 'true');
      setIsTwitterConnected(true);
      toast.success("X Account Connected Successfully");
  };

  const handlePostTweet = async () => {
      // Simulate API call
      await createContent({
          title: tweetDraft.substring(0, 30) + (tweetDraft.length > 30 ? '...' : ''),
          script: tweetDraft,
          platform: 'twitter',
          type: isThreadMode ? 'thread' : 'tweet',
          status: 'scheduled' // or published
      });
      setTweetDraft('');
      toast.success("Tweet Scheduled / Drafted");
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'idea': return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
          case 'scripting': return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
          case 'filming': return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
          case 'editing': return 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30';
          case 'scheduled': return 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30';
          case 'published': return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
          default: return 'bg-zinc-500/20 text-zinc-500';
      }
  };

  const getPlatformIcon = (platform: string) => {
      switch(platform) {
          case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
          case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
          case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
          default: return <PenTool className="w-4 h-4" />;
      }
  };

  // Kanban Columns
  const columns = ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-indigo-900 to-violet-950 p-8 rounded-3xl text-white shadow-2xl border border-indigo-500/20 relative overflow-hidden">
             <div className="relative z-10 space-y-2">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">
                    <LayoutTemplate className="w-4 h-4" /> Creator Studio
                 </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                   Content Grid
                </h1>
                <p className="text-indigo-200 max-w-xl text-lg">
                    Manage your creative pipeline. From spark to broadcast.
                </p>
            </div>
             <div className="relative z-10">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                         <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg hover:scale-105 transition-transform">
                            <Plus className="mr-2 w-5 h-5" /> New Content
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Content Project</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Platform</label>
                                    <Select value={formData.platform} onValueChange={(v: any) => setFormData({...formData, platform: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="twitter">Twitter / X</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tweet">Tweet</SelectItem>
                                            <SelectItem value="thread">Thread</SelectItem>
                                            <SelectItem value="post">Post</SelectItem>
                                            <SelectItem value="reel">Reel</SelectItem>
                                            <SelectItem value="video">Long Video</SelectItem>
                                            <SelectItem value="short">Short</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title / Concept</label>
                                <Input placeholder="Viral Hook..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Script / Notes</label>
                                <Textarea placeholder="Draft content here..." className="h-32" value={formData.script} onChange={e => setFormData({...formData, script: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Initialize Project</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Film className="w-64 h-64 -mb-12 -mr-12 text-white" />
            </div>
         </div>
         
         {/* TABS Interface */}
         <Tabs defaultValue="overview" className="space-y-6">
             <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl h-12">
                 <TabsTrigger value="overview" className="rounded-lg h-10 px-4 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow">Overview</TabsTrigger>
                 <TabsTrigger value="twitter" className="rounded-lg h-10 px-4 font-bold data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow flex items-center gap-2"><Twitter className="w-4 h-4"/> Twitter / X</TabsTrigger>
                 <TabsTrigger value="instagram" className="rounded-lg h-10 px-4 font-bold data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow flex items-center gap-2"><Instagram className="w-4 h-4"/> Instagram</TabsTrigger>
                 <TabsTrigger value="youtube" className="rounded-lg h-10 px-4 font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow flex items-center gap-2"><Youtube className="w-4 h-4"/> YouTube</TabsTrigger>
             </TabsList>

             {/* OVERVIEW TAB (KANBAN) */}
             <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                     {columns.map(col => {
                         const colContents = contents.filter(c => c.status === col);
                         return (
                             <div key={col} className="min-w-[300px] flex flex-col gap-4">
                                 <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                     <span className="font-bold uppercase text-xs tracking-widest text-zinc-500">{col}</span>
                                     <Badge variant="secondary" className="bg-white dark:bg-zinc-800 text-zinc-500">{colContents.length}</Badge>
                                 </div>
                                 
                                 <div className="flex flex-col gap-3">
                                     {colContents.map(item => (
                                         <Card key={item._id} className="cursor-move hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 group">
                                             <CardContent className="p-4 space-y-3">
                                                 <div className="flex justify-between items-start">
                                                     <Badge variant="outline" className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 text-xs py-0.5">
                                                         {getPlatformIcon(item.platform)}
                                                         <span className="capitalize">{item.platform}</span>
                                                     </Badge>
                                                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteContent(item._id!)}>
                                                         <MoreHorizontal className="w-4 h-4" />
                                                     </Button>
                                                 </div>
                                                 <h3 className="font-bold leading-tight">{item.title}</h3>
                                                 
                                                 <div className="flex justify-between items-center pt-2">
                                                     <Badge className={cn("text-[10px] rounded-full px-2 py-0.5 uppercase", getStatusColor(item.status))}>
                                                         {item.type}
                                                     </Badge>
                                                     {/* Move Next Button (Quick Action) */}
                                                     {item.status !== 'published' && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 text-[10px] opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                const nextIdx = columns.indexOf(item.status) + 1;
                                                                if (nextIdx < columns.length) {
                                                                    updateContent(item._id!, { status: columns[nextIdx] as any });
                                                                }
                                                            }}
                                                        >
                                                            &rarr;
                                                        </Button>
                                                     )}
                                                 </div>
                                             </CardContent>
                                         </Card>
                                     ))}
                                     {colContents.length === 0 && (
                                         <div className="h-24 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 text-xs">
                                             No items
                                         </div>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             </TabsContent>

             {/* TWITTER TAB */}
             <TabsContent value="twitter" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 {!isTwitterConnected ? (
                     <Card className="max-w-md mx-auto py-12 text-center space-y-4">
                         <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                             <Twitter className="w-8 h-8 text-blue-500" />
                         </div>
                         <CardTitle>Connect X (Twitter)</CardTitle>
                         <p className="text-muted-foreground px-8">Authorize your X account to schedule threads, draft tweets, and view analytics directly from your OS.</p>
                         <Button size="lg" className="bg-black hover:bg-zinc-800 text-white gap-2" onClick={handleConnectTwitter}>
                             Connect Account <Twitter className="w-4 h-4" />
                         </Button>
                     </Card>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {/* Tweet Drafter (Left Col) */}
                         <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-xl">
                             <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                 <CardTitle className="flex items-center gap-2 text-lg">
                                     <PenTool className="w-5 h-5 text-blue-500" /> Composer
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="p-6 space-y-4">
                                 <div className="flex items-start gap-4">
                                     <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
                                     <div className="flex-1 space-y-2">
                                         <Textarea 
                                            placeholder="What's happening?" 
                                            className="min-h-[150px] border-none text-lg resize-none focus-visible:ring-0 p-0 shadow-none bg-transparent"
                                            value={tweetDraft}
                                            onChange={(e) => setTweetDraft(e.target.value)}
                                         />
                                         <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                             <div className="flex gap-2">
                                                 <Button variant="ghost" size="icon" className="text-blue-500"><ImageIcon className="w-4 h-4" /></Button>
                                                 <Button variant="ghost" size="icon" className="text-blue-500"><Hash className="w-4 h-4" /></Button>
                                                 <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className={cn("text-xs font-bold", isThreadMode ? "text-blue-500 bg-blue-50" : "text-zinc-500")}
                                                    onClick={() => setIsThreadMode(!isThreadMode)}
                                                >
                                                     <Repeat className="w-3 h-3 mr-1" /> Thread
                                                 </Button>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                 <span className={cn("text-xs font-bold", tweetDraft.length > 280 ? "text-red-500" : "text-zinc-400")}>
                                                     {tweetDraft.length} / 280
                                                 </span>
                                                 <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                                                 <Button variant="outline" size="icon"><Clock className="w-4 h-4" /></Button>
                                                 <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 font-bold" onClick={handlePostTweet}>Post</Button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>

                         {/* Scheduled / Drafts Sidebar (Right Col) */}
                         <div className="space-y-6">
                            <Card className="border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Scheduled Queue</h3>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {contents.filter(c => c.platform === 'twitter' && c.status === 'scheduled').length === 0 ? (
                                        <div className="p-8 text-center text-zinc-400 text-xs">Queue empty</div>
                                    ) : (
                                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {contents.filter(c => c.platform === 'twitter' && c.status === 'scheduled').map(item => (
                                                <div key={item._id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                    <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                                                        <Calendar className="w-3 h-3" /> Tomorrow, 10:00 AM
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                             <Card className="border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Draft Ideas</h3>
                                </CardHeader>
                                <CardContent className="p-0">
                                     <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {contents.filter(c => c.platform === 'twitter' && (c.status === 'idea' || c.status === 'scripting')).map(item => (
                                                <div key={item._id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => { setTweetDraft(item.script || item.title); setFormData(item as any); }}>
                                                    <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                                                    <Badge variant="secondary" className="mt-1 text-[10px] h-4">{item.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                </CardContent>
                            </Card>
                         </div>
                     </div>
                 )}
             </TabsContent>

             {/* INSTAGRAM TAB */}
             <TabsContent value="instagram" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 {!localStorage.getItem('instagram_connected') ? (
                     <Card className="max-w-md mx-auto py-12 text-center space-y-4">
                         <div className="mx-auto w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
                             <Instagram className="w-8 h-8 text-pink-500" />
                         </div>
                         <CardTitle>Connect Instagram</CardTitle>
                         <p className="text-muted-foreground px-8">Plan your grid, schedule Reels, and analyze engagement.</p>
                         <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white gap-2" onClick={() => { localStorage.setItem('instagram_connected', 'true'); window.location.reload(); }}>
                             Connect Account <Instagram className="w-4 h-4" />
                         </Button>
                     </Card>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {/* Instagram Feed Preview (Left Col) */}
                         <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                             <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4 bg-zinc-50 dark:bg-zinc-900/50">
                                 <CardTitle className="flex items-center gap-2 text-lg">
                                     <LayoutTemplate className="w-5 h-5 text-pink-500" /> Grid Preview
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="p-4">
                                 <div className="grid grid-cols-3 gap-1 aspect-square bg-zinc-100 dark:bg-zinc-900">
                                     {/* Simulated Feed Items */}
                                     {contents.filter(c => c.platform === 'instagram' && c.status === 'published').slice(0, 9).map((item, i) => (
                                         <div key={i} className="aspect-square bg-zinc-300 dark:bg-zinc-800 relative group cursor-pointer">
                                              {/* Placeholder Image */}
                                              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-[10px] font-bold opacity-50">IMG</div>
                                         </div>
                                     ))}
                                     {/* Scheduled Items (Ghosted) */}
                                      {contents.filter(c => c.platform === 'instagram' && c.status === 'scheduled').slice(0, 3).map((item, i) => (
                                         <div key={`sched-${i}`} className="aspect-square bg-pink-100 dark:bg-pink-900/20 relative group cursor-pointer border-2 border-pink-500/50 border-dashed">
                                              <div className="absolute inset-0 flex items-center justify-center text-pink-500 text-[10px] font-bold">SOON</div>
                                         </div>
                                     ))}
                                 </div>
                             </CardContent>
                         </Card>

                         {/* Editor & Reels (Right Col) */}
                         <div className="md:col-span-2 space-y-6">
                             <Card className="border-zinc-200 dark:border-zinc-800">
                                 <CardHeader className="pb-3">
                                     <CardTitle>Reel Planner</CardTitle>
                                     <CardDescription>Drafting for @User</CardDescription>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                     <div className="flex gap-4">
                                        <div className="h-48 w-32 bg-zinc-900 rounded-lg flex-shrink-0 flex items-center justify-center text-white">
                                            <div className="text-center">
                                                <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <span className="text-[10px]">9:16 Preview</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <Input placeholder="Caption..." />
                                            <Textarea placeholder="Hashtags..." className="h-24" />
                                            <Button className="w-full bg-pink-600 hover:bg-pink-700"><Plus className="w-4 h-4 mr-2" /> Add to Grid</Button>
                                        </div>
                                     </div>
                                 </CardContent>
                             </Card>
                             
                              <Card className="border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Upcoming Posts</h3>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {contents.filter(c => c.platform === 'instagram' && c.status === 'scheduled').map(item => (
                                            <div key={item._id} className="p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-200 rounded-md" />
                                                    <div>
                                                        <p className="text-sm font-bold">{item.title}</p>
                                                        <p className="text-xs text-muted-foreground">Scheduled for TBD</p>
                                                    </div>
                                                </div>
                                                <Badge>Reel</Badge>
                                            </div>
                                        ))}
                                        {contents.filter(c => c.platform === 'instagram' && c.status === 'scheduled').length === 0 && (
                                            <div className="p-6 text-center text-muted-foreground text-xs">No posts scheduled</div>
                                        )}
                                    </div>
                                </CardContent>
                             </Card>
                         </div>
                     </div>
                 )}
             </TabsContent>

             {/* YOUTUBE TAB */}
             <TabsContent value="youtube" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 {!localStorage.getItem('youtube_connected') ? (
                     <Card className="max-w-md mx-auto py-12 text-center space-y-4">
                         <div className="mx-auto w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
                             <Youtube className="w-8 h-8 text-red-600" />
                         </div>
                         <CardTitle>Connect YouTube Studio</CardTitle>
                         <p className="text-muted-foreground px-8">Manage uploads, check SEO, and track subscriber growth.</p>
                         <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={() => { localStorage.setItem('youtube_connected', 'true'); window.location.reload(); }}>
                             Connect Channel <Youtube className="w-4 h-4" />
                         </Button>
                     </Card>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {/* Stats Overview */}
                         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                             <Card className="border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
                                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                     <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">Subscribers</p>
                                     <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">1.2K</h3>
                                     <Badge variant="outline" className="mt-2 text-[10px] bg-green-100 text-green-700 border-green-200">+12%</Badge>
                                 </CardContent>
                             </Card>
                              <Card>
                                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Views (28d)</p>
                                     <h3 className="text-3xl font-black">45.8K</h3>
                                 </CardContent>
                             </Card>
                              <Card>
                                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Watch Time</p>
                                     <h3 className="text-3xl font-black">2.1K <span className="text-sm font-normal text-muted-foreground">hrs</span></h3>
                                 </CardContent>
                             </Card>
                             <Card>
                                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Revenue</p>
                                     <h3 className="text-3xl font-black">$--</h3>
                                 </CardContent>
                             </Card>
                         </div>

                         {/* Editor */}
                         <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800">
                             <CardHeader>
                                 <CardTitle>Video Manager</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl h-32 flex flex-col items-center justify-center text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                                     <Plus className="w-8 h-8 mb-2 opacity-50" />
                                     <p className="font-medium">Upload Video / Drag & Drop</p>
                                 </div>
                                 <div className="space-y-4">
                                     {contents.filter(c => c.platform === 'youtube').map(video => (
                                         <div key={video._id} className="flex gap-4 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:shadow-md transition-shadow">
                                             <div className="w-32 aspect-video bg-zinc-800 rounded-md flex items-center justify-center text-white font-bold text-xs relative overflow-hidden">
                                                 THUMBNAIL
                                                 {video.status === 'published' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Youtube className="w-8 h-8 text-red-600" /></div>}
                                             </div>
                                             <div className="flex-1 space-y-1">
                                                 <h4 className="font-bold line-clamp-1">{video.title}</h4>
                                                 <p className="text-xs text-muted-foreground line-clamp-2">{video.description || "No description"}</p>
                                                  <div className="flex gap-2 pt-2">
                                                     <Badge variant="secondary" className={cn("text-[10px]", getStatusColor(video.status))}>{video.status}</Badge>
                                                     {video.type === 'short' && <Badge variant="outline" className="text-[10px]">Short</Badge>}
                                                  </div>
                                             </div>
                                             <div className="flex flex-col gap-2">
                                                 <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </CardContent>
                         </Card>

                         {/* Checklist */}
                         <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800">
                             <CardHeader>
                                 <CardTitle className="text-lg">Pre-Upload Checklist</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-2">
                                 {['Thumbnail Design', 'Keyword Research', 'Title Optimization', 'Description Links', 'Tags'].map((item, i) => (
                                     <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                         <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700" />
                                         <span className="text-sm font-medium">{item}</span>
                                     </div>
                                 ))}
                             </CardContent>
                         </Card>
                     </div>
                 )}
             </TabsContent>

         </Tabs>

    </div>
  );
}
