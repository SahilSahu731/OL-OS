'use client';

import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-zinc-400" />
                <div>
                    <h1 className="text-2xl font-bold">Channel Settings</h1>
                    <p className="text-muted-foreground">Manage defaults and preferences</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Defaults</CardTitle>
                    <CardDescription>These settings will apply to future uploads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                         <Label>Default Description</Label>
                         <Textarea 
                             placeholder="Standard links, social media handles, etc."
                             className="min-h-[150px] font-mono text-xs"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label>Default Tags</Label>
                         <Input placeholder="comma, separated, values" />
                     </div>
                     <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                             <Label>Auto-Schedule</Label>
                             <div className="text-xs text-muted-foreground">Automatically set new uploads to 12:00 PM</div>
                         </div>
                         <Switch />
                     </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </div>
        </div>
    );
}
