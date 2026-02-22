'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, User, Home, Hash } from 'lucide-react';
import { useSignUp } from '@/hooks/useAuth';

const schema = z.object({
  family_name: z.string().min(2, 'Family name is required'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed'),
  name: z.string().min(2, 'Parent name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpData = z.infer<typeof schema>;

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const signUp = useSignUp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(schema),
    defaultValues: { slug: '' },
  });

  const familyName = watch('family_name');

  const slugHint = useMemo(() => {
    if (!familyName) return 'e.g. musa-family';
    return familyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }, [familyName]);

  const onSubmit = (data: SignUpData) => signUp.mutate(data);

  return (
    <div className="rounded-3xl border border-panel-200 bg-white/95 p-7 shadow-mellow sm:p-9">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-panel-900">Create parent account</h2>
        <p className="mt-1 text-sm text-panel-600">
          Set up your family space once, then invite adults and children.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="family_name" className="mb-1.5 block text-sm font-medium text-panel-700">
              Family name
            </label>
            <div className="relative">
              <Home className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-panel-500" />
              <input
                {...register('family_name')}
                id="family_name"
                placeholder="Ibrahim Family"
                className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>
            {errors.family_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.family_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-panel-700">
              Family slug
            </label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-panel-500" />
              <input
                {...register('slug')}
                id="slug"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder={slugHint}
                className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>
            {errors.slug ? (
              <p className="mt-1 text-xs text-rose-600">{errors.slug.message}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Children use this slug to sign in on the kids app.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-panel-700">
              Your name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-panel-500" />
              <input
                {...register('name')}
                id="name"
                placeholder="Aisha Ibrahim"
                className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

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
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-panel-700">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-panel-300 bg-white py-2.5 pl-3 pr-11 text-sm outline-none transition focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
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
          disabled={signUp.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-panel-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {signUp.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-5 text-sm text-panel-600">
        Already have an account?{' '}
        <Link href="/signin" className="font-semibold text-panel-700 underline-offset-2 hover:underline">
          Sign in here
        </Link>
        .
      </p>
    </div>
  );
}
