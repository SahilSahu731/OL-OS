'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-red-900/5 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
      >
          {/* Decorative bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
          
          <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">System Critical Failure</h2>
                  <p className="text-sm text-zinc-400">
                      An unrecoverable error occurred in the subsystem.
                  </p>
              </div>

              <div className="w-full bg-zinc-900/50 rounded-lg p-4 text-left font-mono text-xs text-red-400 border border-red-900/20 overflow-x-auto">
                  {error.message || "Unknown Error"}
                  {error.digest && <div className="mt-2 text-zinc-600">Digest: {error.digest}</div>}
              </div>

              <div className="flex gap-3 w-full">
                  <Button onClick={() => reset()} className="flex-1 bg-white text-black hover:bg-zinc-200">
                      <RefreshCw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                  <Button variant="outline" asChild className="flex-1 border-zinc-800 hover:bg-zinc-900 hover:text-white">
                      <Link href="/dashboard">
                          <Terminal className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                  </Button>
              </div>
          </div>
      </motion.div>
    </div>
  );
}
