'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import type { WsEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

export function useWebSocket() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const connectingRef = useRef(false);

  const connect = useCallback(() => {
    if (!token || typeof window === 'undefined' || connectingRef.current) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    connectingRef.current = true;
    socketRef.current = new WebSocket(`${WS_URL}?token=${token}`);

    socketRef.current.onopen = () => {
      connectingRef.current = false;
    };

    socketRef.current.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data as string) as WsEvent;

        switch (event.type) {
          case 'task.assigned':
          case 'task.status_updated':
          case 'reward.requested':
          case 'reward.responded':
            void queryClient.invalidateQueries({ queryKey: ['tasks'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
          case 'quiz.assigned':
          case 'quiz.completed':
            void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
          case 'lesson.completed':
            void queryClient.invalidateQueries({ queryKey: ['learn'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
          case 'message.new':
            void queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.info('New message', {
              description: 'A family member sent a new message.',
            });
            break;
          case 'request.new':
          case 'request.responded':
            void queryClient.invalidateQueries({ queryKey: ['requests'] });
            break;
          case 'notification.new':
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            break;
          case 'game.limit_reached':
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
          default:
            break;
        }
      } catch {
        // ignore malformed events
      }
    };

    socketRef.current.onclose = () => {
      connectingRef.current = false;
      reconnectRef.current = setTimeout(connect, 3000);
    };

    socketRef.current.onerror = () => {
      connectingRef.current = false;
      socketRef.current?.close();
    };
  }, [token, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [connect]);
}
