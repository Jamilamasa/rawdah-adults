'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useSignIn } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInData = z.infer<typeof schema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: SignInData) => signIn.mutate(data);

  return (
    <div className="rounded-3xl border border-panel-200 bg-white/95 p-7 shadow-mellow sm:p-9">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-panel-900">Sign in</h2>
        <p className="mt-1 text-sm text-panel-600">
          Continue to your family dashboard and manage daily progress.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-panel-700">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-panel-500" />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-panel-700">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-panel-500" />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-panel-600 hover:bg-panel-100"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={signIn.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-panel-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {signIn.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing you in...
            </>
          ) : (
            'Sign in to dashboard'
          )}
        </button>
      </form>

      <p className="mt-5 text-sm text-panel-600">
        Need a new family account?{' '}
        <Link href="/signup" className="font-semibold text-panel-700 underline-offset-2 hover:underline">
          Create one here
        </Link>
        .
      </p>
    </div>
  );
}
