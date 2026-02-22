import { clsx, type ClassValue } from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return 'just now';
  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function getAgeFromDateOfBirth(value?: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  if (age < 0) return null;
  return age;
}

export function toTitleCase(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getInitials(name?: string) {
  if (!name) return 'R';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getTaskStatusClasses(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    reward_requested: 'bg-indigo-100 text-indigo-700',
    reward_approved: 'bg-emerald-100 text-emerald-700',
    reward_declined: 'bg-rose-100 text-rose-700',
  };

  return statusMap[status] ?? 'bg-slate-100 text-slate-700';
}

export function getRequestStatusClasses(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    declined: 'bg-rose-100 text-rose-700',
  };

  return statusMap[status] ?? 'bg-slate-100 text-slate-700';
}

export const ADULT_PERMISSION_LABELS: Record<string, string> = {
  view_dashboard: 'View dashboard',
  assign_tasks: 'Create and edit tasks',
  view_tasks: 'View tasks',
  approve_rewards: 'Approve/decline rewards',
  view_messages: 'View and send messages',
  manage_quizzes: 'Manage quizzes',
  manage_learn: 'Manage learning content',
  respond_requests: 'Respond to child requests',
};

export const ADULT_PERMISSION_KEYS = Object.keys(ADULT_PERMISSION_LABELS);
