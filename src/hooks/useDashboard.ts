'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.summary,
  });
}

export function useDashboardCharts(days = 30) {
  return useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'task-completion', days],
        queryFn: () => dashboardApi.taskCompletion(days),
      },
      {
        queryKey: ['dashboard', 'game-time', days],
        queryFn: () => dashboardApi.gameTime(days),
      },
      {
        queryKey: ['dashboard', 'quiz-scores', days],
        queryFn: () => dashboardApi.quizScores(days),
      },
      {
        queryKey: ['dashboard', 'learn-progress'],
        queryFn: dashboardApi.learnProgress,
      },
    ],
  });
}
