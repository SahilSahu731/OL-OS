'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Film, Lightbulb, BarChart3, Settings, 
    Youtube, ExternalLink, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function YouTubeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: 'Workstation', href: '/dashboard/content/youtube', icon: LayoutDashboard, exact: true },
        { label: 'Video Library', href: '/dashboard/content/youtube/videos', icon: Film },
        { label: 'Idea Bank', href: '/dashboard/content/youtube/ideas', icon: Lightbulb },
    ];

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-background rounded-2xl border overflow-hidden shadow-sm">
            {/* STUDIO SIDEBAR */}
            <div className="w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/dashboard/content" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                            <Youtube className="w-6 h-6 text-red-600" />
                            <span>Studio</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center p-4 bg-background rounded-xl border shadow-sm mb-6">
                        <Avatar className="w-16 h-16 border-4 border-background shadow-lg mb-3">
                            <AvatarImage src="/placeholder.jpg" />
                            <AvatarFallback className="bg-red-100 text-red-600 text-xl font-bold">OS</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-sm">OL-OS Channel</h3>
                        <p className="text-xs text-muted-foreground mt-1">12.5K Subscribers</p>
                    </div>
                </div>

                <div className="px-3 flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.exact 
                            ? pathname === item.href 
                            : pathname.startsWith(item.href);
                        
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive 
                                        ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 border border-red-100 dark:border-red-900/20" 
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive && "fill-current")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t mt-auto">
                    <Button variant="outline" className="w-full justify-start text-xs text-muted-foreground" size="sm" asChild>
                        <a href="https://youtube.com" target="_blank">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Open Channel
                        </a>
                    </Button>
                </div>
            </div>

            {/* ROUTE CONTENT */}
            <div className="flex-1 overflow-hidden flex flex-col bg-background/50">
                {children}
            </div>
        </div>
    );
}
