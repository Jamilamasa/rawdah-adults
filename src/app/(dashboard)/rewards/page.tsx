'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  Filter,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useChildren } from '@/hooks/useFamily';
import { useCreateReward, useDeleteReward, useRewards, useUpdateReward } from '@/hooks/useRewards';
import { useDueRewards } from '@/hooks/useTasks';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, getTaskStatusClasses, toTitleCase } from '@/lib/utils';

const DEFAULT_FORM = {
  title: '',
  description: '',
  value: 0,
  type: 'virtual',
  icon: '🎁',
};

export default function RewardsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'reward_requested' | 'reward_approved'
  >('all');

  const rewardsQuery = useRewards();
  const { children } = useChildren();

  const dueRewardFilters = useMemo(() => {
    return {
      assigned_to: selectedChild === 'all' ? undefined : selectedChild,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    };
  }, [selectedChild, selectedStatus]);

  const dueRewardsQuery = useDueRewards(dueRewardFilters);

  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

  const rewards = useMemo(() => rewardsQuery.data ?? [], [rewardsQuery.data]);
  const dueRewards = useMemo(() => dueRewardsQuery.data ?? [], [dueRewardsQuery.data]);

  const dueSummary = useMemo(() => {
    return dueRewards.reduce(
      (acc, reward) => {
        acc.total += 1;
        acc.totalValue += reward.reward_value;
        if (reward.task_status === 'reward_requested') {
          acc.awaitingApproval += 1;
          return acc;
        }
        acc.approved += 1;
        acc.approvedValue += reward.reward_value;
        return acc;
      },
      { total: 0, awaitingApproval: 0, approved: 0, totalValue: 0, approvedValue: 0 }
    );
  }, [dueRewards]);

  const editingReward = useMemo(
    () => rewards.find((reward) => reward.id === editingId),
    [editingId, rewards]
  );

  const openEdit = (id: string) => {
    const reward = rewards.find((item) => item.id === id);
    if (!reward) return;
    setEditingId(id);
    setForm({
      title: reward.title,
      description: reward.description ?? '',
      value: reward.value,
      type: reward.type,
      icon: reward.icon ?? '🎁',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      title: form.title,
      description: form.description || undefined,
      value: Number(form.value),
      type: form.type,
      icon: form.icon || undefined,
    };

    if (editingId) {
      updateReward.mutate(
        { id: editingId, body: payload },
        {
          onSuccess: () => resetForm(),
        }
      );
      return;
    }

    createReward.mutate(payload, {
      onSuccess: () => resetForm(),
    });
  };

  const isSaving = createReward.isPending || updateReward.isPending;
  const dueSectionLoading = dueRewardsQuery.isLoading || dueRewardsQuery.isFetching;

  const formatValue = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rewards"
        subtitle="Create meaningful motivators children can earn through effort."
        action={
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
                return;
              }
              setEditingId(null);
              setForm(DEFAULT_FORM);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
          >
            <Plus size={16} />
            {showForm && !editingId ? 'Close form' : 'Add reward'}
          </button>
        }
      />

      <AppCard className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-panel-900">Due Rewards</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track what the family currently owes children for completed tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dueRewardsQuery.refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="content-grid">
          <div className="rounded-xl border border-panel-200 bg-panel-100/40 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Due items</p>
            <p className="mt-1 text-2xl font-bold text-panel-900">{dueSummary.total}</p>
          </div>
          <div className="rounded-xl border border-panel-200 bg-panel-100/40 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Awaiting approval
            </p>
            <p className="mt-1 text-2xl font-bold text-panel-900">{dueSummary.awaitingApproval}</p>
          </div>
          <div className="rounded-xl border border-panel-200 bg-panel-100/40 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Approved value</p>
            <p className="mt-1 text-2xl font-bold text-panel-900">{formatValue(dueSummary.approvedValue)}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Filter size={12} />
              Filter by child
            </label>
            <select
              value={selectedChild}
              onChange={(event) => setSelectedChild(event.target.value)}
              className="w-full rounded-xl border border-panel-300 bg-white px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
            >
              <option value="all">All children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Filter size={12} />
              Filter by status
            </label>
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as 'all' | 'reward_requested' | 'reward_approved')
              }
              className="w-full rounded-xl border border-panel-300 bg-white px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
            >
              <option value="all">All due statuses</option>
              <option value="reward_requested">Reward requested</option>
              <option value="reward_approved">Reward approved</option>
            </select>
          </div>
        </div>

        {dueSectionLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-panel-200 bg-white p-4">
                <div className="mb-3 h-4 w-1/3 rounded bg-panel-100" />
                <div className="mb-2 h-5 w-3/4 rounded bg-panel-100" />
                <div className="h-4 w-1/2 rounded bg-panel-100" />
              </div>
            ))}
          </div>
        ) : dueRewards.length ? (
          <div className="space-y-3">
            {dueRewards.map((dueReward) => (
              <div key={dueReward.task_id} className="rounded-xl border border-panel-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-panel-100 text-lg">
                        {dueReward.reward_icon ?? '🎁'}
                      </span>
                      <h3 className="text-base font-semibold text-panel-900">{dueReward.reward_title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTaskStatusClasses(
                          dueReward.task_status
                        )}`}
                      >
                        {toTitleCase(dueReward.task_status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Gift size={12} /> Child: {dueReward.child_name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CircleDollarSign size={12} /> Value: {formatValue(dueReward.reward_value)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {dueReward.task_status === 'reward_requested' ? (
                          <Clock3 size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {dueReward.task_completed_at
                          ? `Completed ${formatDate(dueReward.task_completed_at)}`
                          : `Assigned ${formatDate(dueReward.task_created_at)}`}
                      </span>
                    </div>

                    <p className="text-sm text-panel-700">
                      Task: <span className="font-medium text-panel-900">{dueReward.task_title}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No due rewards for this filter"
            description="Once children request rewards, owed items will appear here."
            icon={<Gift size={28} />}
          />
        )}
      </AppCard>

      {showForm ? (
        <AppCard>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Title</label>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Extra story time"
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Type</label>
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              >
                <option value="monetary">Monetary</option>
                <option value="virtual">Virtual</option>
                <option value="real">Real</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Value</label>
              <input
                type="number"
                min={0}
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: Number(event.target.value) }))}
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Icon</label>
              <input
                value={form.icon}
                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                placeholder="🎁"
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-panel-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Keep criteria clear and motivating"
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editingId ? 'Save reward' : 'Create reward'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-panel-300 bg-white px-4 py-2 text-sm font-semibold text-panel-700 hover:bg-panel-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </AppCard>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-panel-900">Reward Catalog</h2>
        {dueSummary.totalValue > 0 ? (
          <p className="text-xs text-muted-foreground">
            Current due value across family: {formatValue(dueSummary.totalValue)}
          </p>
        ) : null}
      </div>

      {rewardsQuery.isLoading ? (
        <InlineLoader label="Loading rewards..." />
      ) : rewards.length ? (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <AppCard key={reward.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-panel-100 text-lg">
                      {reward.icon ?? '🎁'}
                    </span>
                    <h3 className="text-base font-semibold text-panel-900">{reward.title}</h3>
                    <span className="rounded-full bg-panel-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-panel-700">
                      {reward.type}
                    </span>
                  </div>
                  {reward.description ? (
                    <p className="max-w-2xl text-sm text-panel-700">{reward.description}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    <span>Value: {reward.value.toLocaleString()}</span>
                    <span>Created: {formatDate(reward.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(reward.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-panel-300 bg-white px-3 py-1.5 text-xs font-semibold text-panel-700 hover:bg-panel-100"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReward.mutate(reward.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
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
          title="No rewards created"
          description="Define a few rewards so completed tasks can turn into meaningful incentives."
          icon={<Gift size={30} />}
          action={
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              Create first reward
            </button>
          }
        />
      )}

      {editingId && editingReward ? (
        <p className="text-xs text-muted-foreground">Editing: {editingReward.title}</p>
      ) : null}
    </div>
  );
}
