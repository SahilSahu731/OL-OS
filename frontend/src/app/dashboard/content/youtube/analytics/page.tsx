'use client';

import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
            <div className="bg-muted/50 p-6 rounded-full mb-6">
                <BarChart3 className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Channel Analytics</h1>
            <p className="max-w-md mx-auto">
                Deep dive metrics are currently being integrated. Check back later for advanced audience retention graphs and revenue estimations.
            </p>
        </div>
    );
}
