'use client';

import { UserSidebar } from '@/components/UserSidebar';
import { useAuthStore } from '@/stores/authStore';
import { StatusHUD } from '@/components/StatusHUD';
import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
          <StatusHUD />
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <PageTransition>
             {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
