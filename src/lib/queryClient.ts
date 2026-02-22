import { QueryClient } from '@tanstack/react-query';
import { APIError } from '@/lib/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (error instanceof APIError) {
          if ([401, 403, 404].includes(error.status)) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
