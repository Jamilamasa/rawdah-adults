'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    select: (data) => data.notifications,
    refetchInterval: 60000,
  });
}

export function useUnreadNotificationCount() {
  const query = useNotifications();
  const count = useMemo(() => query.data?.filter((item) => !item.is_read).length ?? 0, [query.data]);
  return { ...query, count };
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSuccessToast('All notifications marked as read');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not mark notifications as read.');
    },
  });
}

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.readOne,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
