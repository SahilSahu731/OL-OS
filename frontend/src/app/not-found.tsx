'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, FileQuestion, Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 space-y-8 max-w-lg"
      >
        <div className="relative inline-block">
            <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
                <div className="w-32 h-32 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center shadow-2xl relative">
                     <FileQuestion className="w-16 h-16 text-zinc-500" />
                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold text-sm shadow-md animate-bounce">
                        !
                     </div>
                </div>
            </motion.div>
        </div>

        <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
                404
            </h1>
            <div className="h-px w-24 bg-zinc-800 mx-auto" />
            <h2 className="text-xl font-medium text-zinc-400">System Sector Not Found</h2>
            <p className="text-zinc-500">
                The requested URL coordinates do not map to any known sector in the OS. The data may have been corrupted or moved.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" size="lg" asChild className="group">
                <Link href="/dashboard">
                    <Terminal className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> 
                    Reboot to Dashboard
                </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="group bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Return Home
                </Link>
            </Button>
        </div>

        <div className="pt-12 text-xs font-mono text-zinc-700">
            ERROR_CODE: RESOURCE_MISSING_EXCEPTION <br />
            TIMESTAMP: {new Date().toISOString()}
        </div>

      </motion.div>
    </div>
  );
}
