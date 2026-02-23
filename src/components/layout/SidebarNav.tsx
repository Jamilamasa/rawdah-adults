'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { useUnreadMessageCount } from '@/hooks/useMessages';
import { usePendingRequestCount } from '@/hooks/useRequests';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();
  const { count: unreadMessageCount } = useUnreadMessageCount();
  const { count: pendingRequestCount } = usePendingRequestCount();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const badgeCount =
          item.href === '/messages' ? unreadMessageCount : item.href === '/requests' ? pendingRequestCount : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-panel-700 text-white shadow'
                : 'text-panel-700 hover:bg-panel-100 hover:text-panel-800'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
            {badgeCount > 0 ? (
              <span
                className={cn(
                  'ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                  active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
