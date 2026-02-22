'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: requestsApi.list,
    select: (data) => data.requests,
  });
}

export function useRespondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { status: 'approved' | 'declined'; message?: string };
    }) => requestsApi.respond(id, body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['requests'] });
      const label = variables.body.status === 'approved' ? 'approved' : 'declined';
      showSuccessToast(`Request ${label}`, 'Your response has been sent to the child.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not respond to this request.');
    },
  });
}
