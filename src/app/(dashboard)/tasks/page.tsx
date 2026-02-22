'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSessionForm } from '@/hooks/useSessionForm';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { useChildren } from '@/hooks/useFamily';
import {
  useApproveReward,
  useCreateRecurringTask,
  useCreateTask,
  useDeclineReward,
  useDeleteRecurringTask,
  useDeleteTask,
  useRecurringTasks,
  useTaskStats,
  useTasks,
} from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { getTaskStatusClasses, toTitleCase, formatDate } from '@/lib/utils';
import { InlineLoader } from '@/components/shared/InlineLoader';

type ViewMode = 'tasks' | 'recurring';

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>('tasks');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm, clearForm] = useSessionForm('form:tasks', {
    title: '',
    description: '',
    assigned_to: '',
    reward_id: '',
    due_date: '',
  });
  const [recurringForm, setRecurringForm, clearRecurringForm] = useSessionForm('form:recurring-tasks', {
    title: '',
    description: '',
    assigned_to: '',
    reward_id: '',
  });
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  const filters = useMemo(() => {
    const nextFilters: { status?: string; assigned_to?: string } = {};
    if (statusFilter !== 'all') {
      nextFilters.status = statusFilter;
    }
    if (childFilter !== 'all') {
      nextFilters.assigned_to = childFilter;
    }
    return Object.keys(nextFilters).length ? nextFilters : undefined;
  }, [childFilter, statusFilter]);

  const tasksQuery = useTasks(filters);
  const recurringQuery = useRecurringTasks();
  const { children } = useChildren();
  const rewardsQuery = useRewards();
  const stats = useTaskStats(tasksQuery.data);

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const approveReward = useApproveReward();
  const declineReward = useDeclineReward();
  const createRecurringTask = useCreateRecurringTask();
  const deleteRecurringTask = useDeleteRecurringTask();

  const childNameById = useMemo(() => {
    const map = new Map<string, string>();
    children.forEach((child) => map.set(child.id, child.name));
    return map;
  }, [children]);

  const rewardTitleById = useMemo(() => {
    const map = new Map<string, string>();
    (rewardsQuery.data ?? []).forEach((r) => map.set(r.id, r.title));
    return map;
  }, [rewardsQuery.data]);

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.assigned_to) return;

    createTask.mutate(
      {
        title: form.title,
        description: form.description || undefined,
        assigned_to: form.assigned_to,
        reward_id: form.reward_id || undefined,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          clearForm();
          setShowForm(false);
        },
      }
    );
  };

  const handleCreateRecurringTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!recurringForm.title.trim() || !recurringForm.assigned_to) return;

    createRecurringTask.mutate(
      {
        title: recurringForm.title,
        description: recurringForm.description || undefined,
        assigned_to: recurringForm.assigned_to,
        reward_id: recurringForm.reward_id || undefined,
      },
      {
        onSuccess: () => {
          clearRecurringForm();
          setShowRecurringForm(false);
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tasks"
        subtitle="Assign routines, review reward requests, and keep children on track."
        action={
          view === 'tasks' ? (
            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              <Plus size={16} />
              {showForm ? 'Close form' : 'Assign task'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowRecurringForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              <Plus size={16} />
              {showRecurringForm ? 'Close form' : 'Add recurring task'}
            </button>
          )
        }
      />

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView('tasks')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            view === 'tasks'
              ? 'bg-panel-700 text-white'
              : 'border border-panel-300 bg-white text-panel-700 hover:bg-panel-100'
          }`}
        >
          Tasks
        </button>
        <button
          type="button"
          onClick={() => setView('recurring')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            view === 'recurring'
              ? 'bg-panel-700 text-white'
              : 'border border-panel-300 bg-white text-panel-700 hover:bg-panel-100'
          }`}
        >
          <RefreshCw size={11} />
          Recurring
        </button>
      </div>

      {view === 'tasks' ? (
        <>
          <div className="content-grid">
            <AppCard className="p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-bold text-panel-900">{stats.total}</p>
            </AppCard>
            <AppCard className="p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">In progress</p>
              <p className="mt-1 text-2xl font-bold text-panel-900">{stats.inProgress}</p>
            </AppCard>
            <AppCard className="p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Reward requests</p>
              <p className="mt-1 text-2xl font-bold text-panel-900">{stats.rewardRequested}</p>
            </AppCard>
          </div>

          {showForm ? (
            <AppCard>
              <form onSubmit={handleCreateTask} className="grid gap-3 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-panel-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Read Surah Al-Fatiha before Maghrib"
                    required
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-panel-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    placeholder="Include completion details and expected etiquette"
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-panel-700">Assign to child</label>
                    <Link
                      href="/people"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-panel-700 hover:text-panel-900"
                    >
                      <Plus size={12} />
                      Add child
                    </Link>
                  </div>
                  <select
                    value={form.assigned_to}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, assigned_to: event.target.value }))
                    }
                    required
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  >
                    <option value="">Select child</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-panel-700">Reward (optional)</label>
                    <Link
                      href="/rewards"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-panel-700 hover:text-panel-900"
                    >
                      <Plus size={12} />
                      Add reward
                    </Link>
                  </div>
                  <select
                    value={form.reward_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, reward_id: event.target.value }))}
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  >
                    <option value="">No reward</option>
                    {(rewardsQuery.data ?? []).map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Due date (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))}
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={createTask.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-panel-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {createTask.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Creating...
                      </>
                    ) : (
                      'Create task'
                    )}
                  </button>
                </div>
              </form>
            </AppCard>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'in_progress', 'reward_requested', 'completed'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusFilter === status
                    ? 'bg-panel-700 text-white'
                    : 'border border-panel-300 bg-white text-panel-700 hover:bg-panel-100'
                }`}
              >
                {status === 'all' ? 'All' : toTitleCase(status)}
              </button>
            ))}
            <select
              value={childFilter}
              onChange={(event) => setChildFilter(event.target.value)}
              className="rounded-full border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              aria-label="Filter tasks by child"
            >
              <option value="all">All children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {tasksQuery.isLoading ? (
            <InlineLoader label="Loading tasks..." />
          ) : tasksQuery.data?.length ? (
            <div className="space-y-3">
              {tasksQuery.data.map((task) => (
                <AppCard key={task.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-panel-900">{task.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTaskStatusClasses(task.status)}`}>
                          {toTitleCase(task.status)}
                        </span>
                      </div>

                      {task.description ? (
                        <p className="max-w-2xl text-sm leading-relaxed text-panel-700">{task.description}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Assigned to: {childNameById.get(task.assigned_to) ?? 'Unknown child'}</span>
                        <span>Created: {formatDate(task.created_at)}</span>
                        <span>
                          Due:{' '}
                          {task.due_date ? format(new Date(task.due_date), 'PPp') : 'No due date'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {task.status === 'reward_requested' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => approveReward.mutate(task.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => declineReward.mutate(task.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => deleteTask.mutate(task.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tasks yet"
              description="Assign your first child task to start building momentum."
              action={
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
                >
                  Create first task
                </button>
              }
            />
          )}
        </>
      ) : (
        <>
          {showRecurringForm ? (
            <AppCard>
              <form onSubmit={handleCreateRecurringTask} className="grid gap-3 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-panel-700">Title</label>
                  <input
                    value={recurringForm.title}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Read Quran before Fajr"
                    required
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-panel-700">Description (optional)</label>
                  <textarea
                    value={recurringForm.description}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    placeholder="Additional details about this weekend task"
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-panel-700">Assign to child</label>
                    <Link
                      href="/people"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-panel-700 hover:text-panel-900"
                    >
                      <Plus size={12} />
                      Add child
                    </Link>
                  </div>
                  <select
                    value={recurringForm.assigned_to}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, assigned_to: event.target.value }))
                    }
                    required
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  >
                    <option value="">Select child</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-panel-700">Reward (optional)</label>
                    <Link
                      href="/rewards"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-panel-700 hover:text-panel-900"
                    >
                      <Plus size={12} />
                      Add reward
                    </Link>
                  </div>
                  <select
                    value={recurringForm.reward_id}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, reward_id: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
                  >
                    <option value="">No reward</option>
                    {(rewardsQuery.data ?? []).map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end lg:col-span-2">
                  <button
                    type="submit"
                    disabled={createRecurringTask.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-panel-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {createRecurringTask.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save recurring task'
                    )}
                  </button>
                </div>
              </form>
            </AppCard>
          ) : null}

          {recurringQuery.isLoading ? (
            <InlineLoader label="Loading recurring tasks..." />
          ) : recurringQuery.data?.length ? (
            <div className="space-y-3">
              {recurringQuery.data.map((task) => (
                <AppCard key={task.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <RefreshCw size={13} className="shrink-0 text-panel-500" />
                        <h3 className="text-base font-semibold text-panel-900">{task.title}</h3>
                      </div>
                      {task.description ? (
                        <p className="max-w-2xl text-sm leading-relaxed text-panel-700">{task.description}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Assigned to: {childNameById.get(task.assigned_to) ?? 'Unknown child'}</span>
                        {task.reward_id ? (
                          <span>Reward: {rewardTitleById.get(task.reward_id) ?? 'Unknown reward'}</span>
                        ) : null}
                        <span>Added: {formatDate(task.created_at)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteRecurringTask.mutate(task.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </AppCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recurring tasks yet"
              description="Add tasks that automatically assign every weekend."
              action={
                <button
                  type="button"
                  onClick={() => setShowRecurringForm(true)}
                  className="rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
                >
                  Add first recurring task
                </button>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
