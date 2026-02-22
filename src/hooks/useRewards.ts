'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rewardsApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: rewardsApi.list,
    select: (data) => data.rewards,
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardsApi.create,
    onSuccess: (reward) => {
      void queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Reward created', `"${reward.title}" is available for assignments.`);
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not create this reward.');
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof rewardsApi.update>[1] }) =>
      rewardsApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Reward updated');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not update this reward.');
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rewardsApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Reward deleted');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not delete this reward.');
    },
  });
}
