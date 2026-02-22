'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useConversations() {
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: messagesApi.conversations,
    select: (data) => data.conversations,
    refetchInterval: 15000,
  });
}

export function useMessageThread(userId?: string) {
  return useQuery({
    queryKey: ['messages', 'thread', userId],
    queryFn: () => messagesApi.thread(userId as string),
    select: (data) => data.messages,
    enabled: Boolean(userId),
    refetchInterval: 8000,
  });
}

export function useUnreadIncoming(messages?: { read_at?: string; recipient_id: string }[], userId?: string) {
  return useMemo(
    () => (messages ?? []).filter((msg) => !msg.read_at && msg.recipient_id === userId).length,
    [messages, userId]
  );
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', 'thread', variables.recipient_id] });
      void queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      showSuccessToast('Message sent', 'Your message has been delivered.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not send this message.');
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
