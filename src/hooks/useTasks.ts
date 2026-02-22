'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recurringTasksApi, tasksApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';
import type { Task } from '@/types';

export function useTasks(filters?: { assigned_to?: string; status?: string }) {
  return useQuery({
    queryKey: ['tasks', filters ?? {}],
    queryFn: () => tasksApi.list(filters),
    select: (data) => data.tasks,
  });
}

export function useDueRewards(filters?: {
  assigned_to?: string;
  status?: 'reward_requested' | 'reward_approved';
}) {
  return useQuery({
    queryKey: ['tasks', 'due-rewards', filters ?? {}],
    queryFn: () => tasksApi.dueRewards(filters),
    select: (data) => data.due_rewards,
  });
}

export function useTaskStats(tasks?: Task[]) {
  return useMemo(() => {
    const data = tasks ?? [];
    return {
      total: data.length,
      pending: data.filter((task) => task.status === 'pending').length,
      inProgress: data.filter((task) => task.status === 'in_progress').length,
      rewardRequested: data.filter((task) => task.status === 'reward_requested').length,
      completed: data.filter((task) =>
        ['completed', 'reward_approved'].includes(task.status)
      ).length,
    };
  }, [tasks]);
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Task assigned', `"${task.title}" is now visible to the child.`);
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not create this task.');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof tasksApi.update>[1] }) =>
      tasksApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Task updated');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not update this task.');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Task deleted');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not delete this task.');
    },
  });
}

export function useApproveReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.approveReward,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Reward approved', `Reward request for "${task.title}" has been approved.`);
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not approve this reward request.');
    },
  });
}

export function useDeclineReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.declineReward,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Reward declined', `The reward request for "${task.title}" was declined.`);
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not decline this reward request.');
    },
  });
}

export function useRecurringTasks() {
  return useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: () => recurringTasksApi.list(),
    select: (data) => data.recurring_tasks,
  });
}

export function useCreateRecurringTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringTasksApi.create,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      showSuccessToast('Recurring task created', `"${task.title}" will auto-assign every weekend.`);
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not create recurring task.');
    },
  });
}

export function useDeleteRecurringTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringTasksApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      showSuccessToast('Recurring task deleted');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not delete recurring task.');
    },
  });
}
