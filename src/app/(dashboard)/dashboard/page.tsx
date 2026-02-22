'use client';

import dynamic from 'next/dynamic';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useDashboardCharts, useDashboardSummary } from '@/hooks/useDashboard';
import { PageHeader } from '@/components/shared/PageHeader';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ChartsSkeleton } from '@/components/dashboard/ChartsSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

const TaskCompletionChart = dynamic(
  () => import('@/components/dashboard/TaskCompletionChart').then((mod) => mod.TaskCompletionChart),
  { ssr: false, loading: () => <ChartsSkeleton /> }
);

const GameTimeChart = dynamic(
  () => import('@/components/dashboard/GameTimeChart').then((mod) => mod.GameTimeChart),
  { ssr: false, loading: () => <ChartsSkeleton /> }
);

const QuizScoresChart = dynamic(
  () => import('@/components/dashboard/QuizScoresChart').then((mod) => mod.QuizScoresChart),
  { ssr: false, loading: () => <ChartsSkeleton /> }
);

const LearnProgressChart = dynamic(
  () => import('@/components/dashboard/LearnProgressChart').then((mod) => mod.LearnProgressChart),
  { ssr: false, loading: () => <ChartsSkeleton /> }
);

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const [taskCompletionQuery, gameTimeQuery, quizScoresQuery, learnProgressQuery] = useDashboardCharts();

  const anyChartLoading =
    taskCompletionQuery.isLoading ||
    gameTimeQuery.isLoading ||
    quizScoresQuery.isLoading ||
    learnProgressQuery.isLoading;

  const anyChartError =
    taskCompletionQuery.isError ||
    gameTimeQuery.isError ||
    quizScoresQuery.isError ||
    learnProgressQuery.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Track family progress, learning momentum, and pending actions."
      />

      {summaryQuery.isLoading ? (
        <InlineLoader label="Fetching family summary..." />
      ) : null}

      {summaryQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            We could not load summary metrics.
            <button
              type="button"
              onClick={() => summaryQuery.refetch()}
              className="ml-1 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-xs"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      ) : null}

      {summaryQuery.data ? <SummaryCards summary={summaryQuery.data} /> : null}

      {anyChartLoading ? <InlineLoader label="Loading chart insights..." /> : null}

      {anyChartError ? (
        <EmptyState
          title="Chart insights unavailable"
          description="One or more analytics endpoints failed. Retry to refresh your visual trends."
          icon={<AlertTriangle size={28} />}
          action={
            <button
              type="button"
              onClick={() => {
                void taskCompletionQuery.refetch();
                void gameTimeQuery.refetch();
                void quizScoresQuery.refetch();
                void learnProgressQuery.refetch();
              }}
              className="rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              Retry analytics
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <TaskCompletionChart data={taskCompletionQuery.data?.data ?? []} />
          <GameTimeChart data={gameTimeQuery.data?.data ?? []} />
          <QuizScoresChart data={quizScoresQuery.data?.data ?? []} />
          <LearnProgressChart data={learnProgressQuery.data?.data ?? []} />
        </div>
      )}
    </div>
  );
}
