'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useSignOut } from '@/hooks/useAuth';
import { useUnreadMessageCount } from '@/hooks/useMessages';
import { usePendingRequestCount } from '@/hooks/useRequests';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

export function TopBar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const family = useAuthStore((state) => state.family);
  const { count } = useUnreadNotificationCount();
  const { count: unreadMessageCount } = useUnreadMessageCount();
  const { count: pendingRequestCount } = usePendingRequestCount();
  const signOut = useSignOut();

  return (
    <header className="glass sticky top-0 z-30 border-b border-panel-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-panel-300 bg-white text-panel-700 hover:bg-panel-100 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-panel-900">{family?.name ?? 'Rawdah'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.role === 'parent' ? 'Parent account' : 'Adult relative account'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative inline-flex size-9 items-center justify-center rounded-lg border border-panel-300 bg-white text-panel-700 hover:bg-panel-100"
            aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
          >
            <Bell size={16} />
            {count > 0 ? (
              <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => signOut.mutate()}
            className="inline-flex items-center gap-2 rounded-lg border border-panel-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
            disabled={signOut.isPending}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>

          <div className="inline-flex size-9 items-center justify-center rounded-full bg-panel-700 text-sm font-bold text-white">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all lg:hidden',
          open ? 'max-h-96 pt-3' : 'max-h-0'
        )}
      >
        <nav className="grid gap-1 rounded-xl border border-panel-200 bg-white p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badgeCount =
              item.href === '/messages' ? unreadMessageCount : item.href === '/requests' ? pendingRequestCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-panel-700 hover:bg-panel-100"
              >
                <Icon size={15} />
                {item.label}
                {badgeCount > 0 ? (
                  <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 text-[10px] font-semibold text-rose-700">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
