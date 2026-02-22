'use client';

import { useMemo, useState } from 'react';
import { useSessionForm } from '@/hooks/useSessionForm';
import { useQueries } from '@tanstack/react-query';
import { Copy, ExternalLink, Eye, EyeOff, Loader2, ShieldCheck, UserPlus, UserX, X } from 'lucide-react';
import {
  useAccessControl,
  useCreateMember,
  useDeactivateMember,
  useFamilyMembers,
  useRevokeAccessControl,
  useSetAccessControl,
  useUpdateMember,
} from '@/hooks/useFamily';
import { useAuthStore } from '@/store/authStore';
import {
  ADULT_PERMISSION_KEYS,
  ADULT_PERMISSION_LABELS,
  formatDate,
  getAgeFromDateOfBirth,
  toTitleCase,
} from '@/lib/utils';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { familyApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

const MEMBER_FORM_DEFAULT = {
  role: 'child',
  name: '',
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  child_age: 9,
  game_limit_minutes: 60,
};

const MEMBER_FORM_OMIT = ['password', 'confirm_password'] as const;
const ADULT_PLATFORM_URL = process.env.NEXT_PUBLIC_ADULT_PLATFORM_URL ?? 'https://app.rawdah.app';
const KIDS_PLATFORM_URL = process.env.NEXT_PUBLIC_KIDS_PLATFORM_URL ?? 'https://kids.rawdah.app';

type MemberRole = 'parent' | 'child' | 'adult_relative';

type CreatedMemberCredentials = {
  familyName: string;
  login: string;
  password: string;
  platformUrl: string;
};

function getPlatformURLForRole(role: MemberRole) {
  return role === 'child' ? KIDS_PLATFORM_URL : ADULT_PLATFORM_URL;
}

async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available in this environment.');
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error('Could not copy to clipboard.');
  }
}

export default function PeoplePage() {
  const user = useAuthStore((state) => state.user);
  const family = useAuthStore((state) => state.family);
  const isParent = user?.role === 'parent';

  const [showCreate, setShowCreate] = useState(false);
  const [memberForm, setMemberForm, clearMemberForm] = useSessionForm(
    'form:member-create',
    MEMBER_FORM_DEFAULT,
    MEMBER_FORM_OMIT
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [childAgeDrafts, setChildAgeDrafts] = useState<Record<string, string>>({});
  const [childAgeErrors, setChildAgeErrors] = useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = useState<CreatedMemberCredentials | null>(null);

  const membersQuery = useFamilyMembers();
  const accessControlQuery = useAccessControl();

  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deactivateMember = useDeactivateMember();
  const setAccess = useSetAccessControl();
  const revokeAccess = useRevokeAccessControl();

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  const children = useMemo(() => members.filter((member) => member.role === 'child'), [members]);
  const adultRelatives = useMemo(
    () => members.filter((member) => member.role === 'adult_relative' && member.is_active),
    [members]
  );

  const rantCountQueries = useQueries({
    queries: children.map((child) => ({
      queryKey: ['family', 'rants', child.id],
      queryFn: () => familyApi.rantCount(child.id),
      enabled: isParent,
    })),
  });

  const rantCountByChildId = useMemo(() => {
    const map = new Map<string, number>();
    children.forEach((child, idx) => {
      map.set(child.id, rantCountQueries[idx]?.data?.count ?? 0);
    });
    return map;
  }, [children, rantCountQueries]);

  const permissionsByGrantee = useMemo(() => {
    const map = new Map<string, string[]>();
    (accessControlQuery.data ?? []).forEach((entry) => {
      map.set(entry.grantee_id, entry.permissions);
    });
    return map;
  }, [accessControlQuery.data]);

  const handleCreateMember = (event: React.FormEvent) => {
    event.preventDefault();

    if (memberForm.password !== memberForm.confirm_password) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError(null);
    const role = memberForm.role as MemberRole;
    const name = memberForm.name.trim();
    const username = memberForm.username.trim();
    const email = memberForm.email.trim().toLowerCase();
    const password = memberForm.password;
    const login = role === 'child' ? username : email;
    const familyName = family?.name?.trim() ?? '';

    createMember.mutate(
      {
        role,
        name,
        username: role === 'child' ? username : undefined,
        email: role !== 'child' ? email : undefined,
        password,
        child_age: role === 'child' ? memberForm.child_age : undefined,
        game_limit_minutes: role === 'child' ? memberForm.game_limit_minutes : undefined,
      },
      {
        onSuccess: () => {
          clearMemberForm();
          setShowPassword(false);
          setShowConfirmPassword(false);
          setPasswordError(null);
          setShowCreate(false);
          setCreatedCredentials({
            familyName,
            login,
            password,
            platformUrl: getPlatformURLForRole(role),
          });
        },
      }
    );
  };

  const copyCredential = async (label: string, value: string) => {
    try {
      await copyText(value);
      showSuccessToast(`${label} copied`);
    } catch (error) {
      showApiErrorToast(error, `Could not copy ${label.toLowerCase()}.`);
    }
  };

  const togglePermission = (granteeId: string, permission: string, checked: boolean) => {
    const current = permissionsByGrantee.get(granteeId) ?? [];
    const next = checked ? Array.from(new Set([...current, permission])) : current.filter((p) => p !== permission);

    if (next.length === 0) {
      revokeAccess.mutate(granteeId);
      return;
    }

    setAccess.mutate({ granteeId, permissions: next });
  };

  const saveChildAge = (memberId: string) => {
    const rawValue = childAgeDrafts[memberId];
    const parsedAge = Number(rawValue);

    if (!Number.isFinite(parsedAge) || parsedAge < 5 || parsedAge > 18) {
      setChildAgeErrors((prev) => ({ ...prev, [memberId]: 'Age must be between 5 and 18.' }));
      return;
    }

    setChildAgeErrors((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });

    updateMember.mutate(
      { id: memberId, body: { child_age: parsedAge } },
      {
        onSuccess: () => {
          setChildAgeDrafts((prev) => {
            const next = { ...prev };
            delete next[memberId];
            return next;
          });
        },
      }
    );
  };

  const loading = membersQuery.isLoading || (isParent && accessControlQuery.isLoading);

  return (
    <div className="space-y-5">
      <PageHeader
        title="People"
        subtitle="Invite family members, manage limits, and fine-tune adult access."
        action={
          isParent ? (
            <button
              type="button"
              onClick={() => setShowCreate((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              <UserPlus size={16} />
              {showCreate ? 'Close form' : 'Add member'}
            </button>
          ) : null
        }
      />

      {showCreate && isParent ? (
        <AppCard>
          <form onSubmit={handleCreateMember} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Role</label>
              <select
                value={memberForm.role}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, role: event.target.value }))
                }
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              >
                <option value="child">Child</option>
                <option value="adult_relative">Adult relative</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Name</label>
              <input
                required
                value={memberForm.name}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              />
            </div>

            {memberForm.role === 'child' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Username</label>
                  <input
                    required
                    value={memberForm.username}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, username: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Daily game limit (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    value={memberForm.game_limit_minutes}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, game_limit_minutes: Number(event.target.value) }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Age</label>
                  <input
                    required
                    type="number"
                    min={5}
                    max={18}
                    value={memberForm.child_age}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, child_age: Number(event.target.value) }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used for age-appropriate quizzes. You can update this in People anytime.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-panel-700">Email</label>
                <input
                  required
                  type="email"
                  value={memberForm.email}
                  onChange={(event) =>
                    setMemberForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={memberForm.password}
                  onChange={(event) => {
                    const nextPassword = event.target.value;
                    setMemberForm((prev) => ({ ...prev, password: nextPassword }));
                    if (memberForm.confirm_password && nextPassword !== memberForm.confirm_password) {
                      setPasswordError('Passwords do not match.');
                    } else {
                      setPasswordError(null);
                    }
                  }}
                  className="w-full rounded-xl border border-panel-300 px-3 py-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-panel-600 hover:bg-panel-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Confirm password</label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={memberForm.confirm_password}
                  onChange={(event) => {
                    const nextConfirm = event.target.value;
                    setMemberForm((prev) => ({ ...prev, confirm_password: nextConfirm }));
                    if (memberForm.password && memberForm.password !== nextConfirm) {
                      setPasswordError('Passwords do not match.');
                    } else {
                      setPasswordError(null);
                    }
                  }}
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm ${
                    passwordError ? 'border-rose-400' : 'border-panel-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-panel-600 hover:bg-panel-100"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordError ? <p className="mt-1 text-xs text-rose-600">{passwordError}</p> : null}
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={
                  createMember.isPending ||
                  !memberForm.password ||
                  !memberForm.confirm_password ||
                  memberForm.password !== memberForm.confirm_password
                }
                className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
              >
                {createMember.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                Create member
              </button>
            </div>
          </form>
        </AppCard>
      ) : null}

      {loading ? (
        <InlineLoader label="Loading family members..." />
      ) : members.length ? (
        <div className="space-y-4">
          {members.map((member) => {
            const childAge = member.role === 'child' ? getAgeFromDateOfBirth(member.date_of_birth) : null;
            const childAgeDraft =
              childAgeDrafts[member.id] ?? (childAge !== null ? String(childAge) : '');
            const childAgeError = childAgeErrors[member.id];

            return (
              <AppCard key={member.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-panel-900">{member.name}</h3>
                      <span className="rounded-full bg-panel-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-panel-700">
                        {toTitleCase(member.role)}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Created: {formatDate(member.created_at)}</span>
                      {member.email ? <span>Email: {member.email}</span> : null}
                      {member.username ? <span>Username: {member.username}</span> : null}
                      {member.role === 'child' ? (
                        <span>Game limit: {member.game_limit_minutes} mins/day</span>
                      ) : null}
                      {member.role === 'child' ? (
                        <span>Age: {childAge !== null ? `${childAge} years` : 'Not set'}</span>
                      ) : null}
                      {isParent && member.role === 'child' ? (
                        <span>Rants (private count): {rantCountByChildId.get(member.id) ?? 0}</span>
                      ) : null}
                    </div>

                    {isParent && member.role === 'child' ? (
                      <div className="mt-1 flex flex-wrap items-end gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-panel-600">
                            Update age
                          </label>
                          <input
                            type="number"
                            min={5}
                            max={18}
                            value={childAgeDraft}
                            onChange={(event) => {
                              const next = event.target.value;
                              setChildAgeDrafts((prev) => ({ ...prev, [member.id]: next }));
                              setChildAgeErrors((prev) => {
                                const updated = { ...prev };
                                delete updated[member.id];
                                return updated;
                              });
                            }}
                            className="w-28 rounded-lg border border-panel-300 px-2.5 py-1.5 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => saveChildAge(member.id)}
                          disabled={updateMember.isPending || !childAgeDraft}
                          className="inline-flex items-center gap-2 rounded-lg bg-panel-700 px-3 py-2 text-xs font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
                        >
                          {updateMember.isPending ? <Loader2 size={13} className="animate-spin" /> : null}
                          Save age
                        </button>
                      </div>
                    ) : null}

                    {isParent && member.role === 'child' && childAgeError ? (
                      <p className="text-xs text-rose-600">{childAgeError}</p>
                    ) : null}
                  </div>

                  {isParent && member.id !== user?.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => deactivateMember.mutate(member.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <UserX size={13} /> Deactivate
                      </button>
                    </div>
                  ) : null}
                </div>
              </AppCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No family members yet" description="Add your first child or adult relative to begin." />
      )}

      {isParent && adultRelatives.length ? (
        <AppCard>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-panel-700" />
            <h2 className="text-lg font-semibold text-panel-900">Adult relative permissions</h2>
          </div>

          <div className="space-y-4">
            {adultRelatives.map((adult) => {
              const currentPermissions = permissionsByGrantee.get(adult.id) ?? [];

              return (
                <div key={adult.id} className="rounded-xl border border-panel-200 bg-white p-4">
                  <p className="text-sm font-semibold text-panel-900">{adult.name}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {ADULT_PERMISSION_KEYS.map((permission) => {
                      const checked = currentPermissions.includes(permission);

                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 rounded-lg border border-panel-200 bg-panel-50 px-3 py-2 text-xs text-panel-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              togglePermission(adult.id, permission, event.target.checked)
                            }
                          />
                          {ADULT_PERMISSION_LABELS[permission]}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </AppCard>
      ) : null}

      {createdCredentials ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-panel-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-panel-900">Member login details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share these credentials securely with the person you just created.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-panel-600 hover:bg-panel-100"
                aria-label="Close login details modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-panel-600">Family name</div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-panel-900">
                    {createdCredentials.familyName || 'Not available'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyCredential('Family name', createdCredentials.familyName)}
                    disabled={!createdCredentials.familyName}
                    className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100 disabled:opacity-60"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-panel-200 bg-panel-50 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-panel-600">Username / email</div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-panel-900">{createdCredentials.login}</p>
                  <button
                    type="button"
                    onClick={() => void copyCredential('Username', createdCredentials.login)}
                    className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-panel-200 bg-panel-50 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-panel-600">Password</div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-panel-900">{createdCredentials.password}</p>
                  <button
                    type="button"
                    onClick={() => void copyCredential('Password', createdCredentials.password)}
                    className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-panel-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-panel-600">Platform link</p>
              <a
                href={createdCredentials.platformUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-panel-800 underline decoration-panel-300 underline-offset-4"
              >
                {createdCredentials.platformUrl}
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="inline-flex items-center rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
