import { toast } from 'sonner';
import { APIError } from '@/lib/api';

export function showApiErrorToast(error: unknown, fallback?: string) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      toast.error('Session expired', {
        description: 'Please sign in again to continue managing your family.',
      });
      return;
    }

    if (error.status === 403) {
      toast.error("You don't have permission for this", {
        description: 'Ask the family owner to grant the required access.',
      });
      return;
    }

    if (error.status === 404) {
      toast.error('We could not find that resource', {
        description: 'It may have been removed or you may not have access anymore.',
      });
      return;
    }

    if (error.status === 422) {
      toast.error('Some fields need attention', {
        description: error.message,
      });
      return;
    }

    if (error.status === 429) {
      toast.error('Too many requests', {
        description: 'Please wait a little and try again.',
      });
      return;
    }

    if (error.status >= 500) {
      toast.error('Something went wrong on our side', {
        description: 'Please retry in a moment.',
      });
      return;
    }

    toast.error(error.message || fallback || 'Request failed.');
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || fallback || 'Request failed.');
    return;
  }

  toast.error(fallback || 'Request failed.');
}

export function showSuccessToast(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}
