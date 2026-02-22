'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { APIError, authApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';

export function useSignIn() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.signin,
    onSuccess: (session) => {
      setSession(session);
      showSuccessToast(`Welcome back, ${session.user.name}`, 'Your family dashboard is ready.');
      router.push('/dashboard');
    },
    onError: (error) => {
      if (error instanceof APIError && error.status === 401) {
        toast.error('Sign in failed', {
          description: error.message || 'The provided credentials are incorrect.',
        });
        return;
      }
      showApiErrorToast(error, 'Sign in failed. Please check your details and try again.');
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (session) => {
      setSession(session);
      showSuccessToast('Account created successfully', 'Welcome to Rawdah. Let us set up your family.');
      router.push('/dashboard');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not create your account. Please try again.');
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: authApi.signout,
    onSettled: () => {
      clearSession();
      showSuccessToast('Signed out', 'See you next time.');
      router.push('/signin');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      showSuccessToast('Password updated', 'Your account security has been refreshed.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Unable to update your password right now.');
    },
  });
}
