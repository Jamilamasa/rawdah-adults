'use client';

import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { showApiErrorToast } from '@/lib/toast';

export function useAskAI() {
  return useMutation({
    mutationFn: (question: string) => aiApi.ask({ question }),
    onError: (error) => {
      showApiErrorToast(error, 'Could not get an AI response right now.');
    },
  });
}
