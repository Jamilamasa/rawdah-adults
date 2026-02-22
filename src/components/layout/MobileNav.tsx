'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

const MOBILE_ITEMS = NAV_ITEMS.slice(0, 5);

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-panel-200 bg-white/92 px-2 pb-2 pt-2 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {MOBILE_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium',
                  active ? 'bg-panel-700 text-white' : 'text-panel-700 hover:bg-panel-100'
                )}
              >
                <Icon className="mb-1 size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
