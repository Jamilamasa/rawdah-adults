'use client';

import { Bell, CheckCheck } from 'lucide-react';
import {
  useNotifications,
  useReadAllNotifications,
  useReadNotification,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const notificationsQuery = useNotifications();
  const { count } = useUnreadNotificationCount();
  const readAll = useReadAllNotifications();
  const readOne = useReadNotification();

  const notifications = notificationsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Stay up to date with family activities and approvals."
        action={
          <button
            type="button"
            onClick={() => readAll.mutate()}
            disabled={readAll.isPending || count === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-panel-300 bg-white px-4 py-2 text-sm font-semibold text-panel-700 hover:bg-panel-100 disabled:opacity-70"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        }
      />

      <AppCard className="p-4">
        <p className="text-sm text-muted-foreground">Unread notifications</p>
        <p className="mt-1 text-2xl font-bold text-panel-900">{count}</p>
      </AppCard>

      {notificationsQuery.isLoading ? (
        <InlineLoader label="Loading notifications..." />
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <AppCard key={notification.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-panel-900">{notification.title}</h3>
                    {!notification.is_read ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-panel-700">{notification.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>

                {!notification.is_read ? (
                  <button
                    type="button"
                    onClick={() => readOne.mutate(notification.id)}
                    className="rounded-lg border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </AppCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications yet"
          description="New activity alerts will appear here."
          icon={<Bell size={28} />}
        />
      )}
    </div>
  );
}
