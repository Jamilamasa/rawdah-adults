'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonsApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useQuranLessons() {
  return useQuery({
    queryKey: ['learn', 'quran-lessons'],
    queryFn: lessonsApi.listQuran,
    select: (data) => data.lessons,
  });
}

export function useLearnContent() {
  return useQuery({
    queryKey: ['learn', 'content'],
    queryFn: lessonsApi.listLearn,
    select: (data) => data.content,
  });
}

export function useCreateQuranLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lessonsApi.createQuran,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learn', 'quran-lessons'] });
      showSuccessToast('Quran lesson assigned');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not assign this lesson.');
    },
  });
}

export function useCreateLearnContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lessonsApi.createLearn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learn', 'content'] });
      showSuccessToast('Learning content published');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not publish this content.');
    },
  });
}
