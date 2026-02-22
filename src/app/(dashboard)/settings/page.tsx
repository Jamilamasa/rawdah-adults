'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useFamily, useUpdateFamily } from '@/hooks/useFamily';
import { useChangePassword } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { AppCard } from '@/components/shared/AppCard';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateFamilyStore = useAuthStore((state) => state.updateFamily);

  const familyQuery = useFamily();
  const updateFamily = useUpdateFamily();
  const changePassword = useChangePassword();

  const [familyName, setFamilyName] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
  });

  useEffect(() => {
    if (familyQuery.data?.name) {
      setFamilyName(familyQuery.data.name);
    }
  }, [familyQuery.data?.name]);

  const handleFamilyUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    updateFamily.mutate(
      { name: familyName, logo_url: familyQuery.data?.logo_url ?? null },
      {
        onSuccess: (family) => {
          updateFamilyStore({ name: family.name, logo_url: family.logo_url });
        },
      }
    );
  };

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();
    changePassword.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ current_password: '', new_password: '' });
      },
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Keep your family profile and account security up to date."
      />

      {familyQuery.isLoading ? <InlineLoader label="Loading settings..." /> : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <AppCard>
          <h2 className="text-lg font-semibold text-panel-900">Family profile</h2>
          <p className="mb-4 text-sm text-muted-foreground">Visible to all family members.</p>

          <form onSubmit={handleFamilyUpdate} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Family name</label>
              <input
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                required
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Family slug</label>
              <input
                value={familyQuery.data?.slug ?? ''}
                disabled
                className="w-full rounded-xl border border-panel-200 bg-panel-50 px-3 py-2 text-sm text-muted-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={updateFamily.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
            >
              {updateFamily.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
              Save profile
            </button>
          </form>
        </AppCard>

        <AppCard>
          <h2 className="text-lg font-semibold text-panel-900">Account security</h2>
          <p className="mb-4 text-sm text-muted-foreground">Protect your parent account credentials.</p>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Current password</label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                }
                required
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">New password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))
                }
                required
                minLength={8}
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={changePassword.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
            >
              {changePassword.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
              Update password
            </button>
          </form>
        </AppCard>
      </div>

      <AppCard>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-panel-700" />
          <h2 className="text-lg font-semibold text-panel-900">Current session</h2>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-panel-700 sm:grid-cols-2">
          <p>
            <span className="font-semibold">Name:</span> {user?.name ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user?.role ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Theme:</span> {user?.theme ?? 'default'}
          </p>
        </div>
      </AppCard>
    </div>
  );
}
