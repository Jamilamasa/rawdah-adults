'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuthStore } from '@/store/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useWebSocket();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user || user.role === 'child') {
      router.replace('/signin');
    }
  }, [hasHydrated, isAuthenticated, router, user]);

  if (!hasHydrated || (isAuthenticated && !user)) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-panel-200 border-t-panel-700" />
          <p className="text-sm font-semibold text-panel-700">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role === 'child') return null;

  return (
    <div className={`min-h-dvh ${user.theme ? `theme-${user.theme}` : ''}`}>
      <div className="grid min-h-dvh lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-panel-200 bg-gradient-to-b from-[var(--sidebar-start)] to-[var(--sidebar-end)] px-4 py-5 lg:block">
          <div className="mb-7 flex items-center gap-2 px-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-panel-700 text-white">
              🌿
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-panel-500">Rawdah</p>
              <p className="text-sm font-bold text-panel-900">Adults Portal</p>
            </div>
          </div>
          <SidebarNav />
        </aside>

        <div className="relative flex min-h-dvh flex-col pb-20 lg:pb-0">
          <TopBar />
          <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
