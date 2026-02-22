'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hadithApi, prophetsApi, quranApi, quizzesApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useQuizzes(params?: { type?: 'hadith' | 'prophet' | 'quran' | 'topic' }) {
  return useQuery({
    queryKey: ['quizzes', params ?? {}],
    queryFn: () => quizzesApi.list(params),
  });
}

export function useHadithLibrary(params?: { difficulty?: string }) {
  return useQuery({
    queryKey: ['hadiths', params ?? {}],
    queryFn: () => hadithApi.list(params),
    select: (data) => data.hadiths,
  });
}

export function useProphets() {
  return useQuery({
    queryKey: ['prophets'],
    queryFn: prophetsApi.list,
    select: (data) => data.prophets,
  });
}

export function useQuranVerses(params?: { topic?: string; difficulty?: string }) {
  return useQuery({
    queryKey: ['quran-verses', params ?? {}],
    queryFn: () => quranApi.list(params),
    select: (data) => data.verses,
  });
}

export function useAssignHadithQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizzesApi.assignHadith,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      showSuccessToast('Hadith quiz assigned', 'The child can start this quiz in the kids portal.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not assign the hadith quiz.');
    },
  });
}

export function useAssignProphetQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizzesApi.assignProphet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      showSuccessToast('Prophet quiz assigned');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not assign the prophet quiz.');
    },
  });
}

export function useAssignQuranQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizzesApi.assignQuran,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      showSuccessToast('Quran quiz assigned');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not assign the Quran quiz.');
    },
  });
}

export function useAssignTopicQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizzesApi.assignTopic,
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      showSuccessToast(
        'Learning quiz assigned',
        `${quiz.questions.length} questions generated for "${quiz.topic}".`
      );
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not generate and assign this learning quiz.');
    },
  });
}
