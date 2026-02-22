'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useDashboardCharts, useDashboardSummary } from '@/hooks/useDashboard';
import { useChildren } from '@/hooks/useFamily';
import { useTasks } from '@/hooks/useTasks';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useAskAI } from '@/hooks/useAI';
import { PageHeader } from '@/components/shared/PageHeader';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import {
  ChildPerformanceOverview,
  type ChildPerformanceMetric,
} from '@/components/dashboard/ChildPerformanceOverview';
import { ChartsSkeleton } from '@/components/dashboard/ChartsSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { AppCard } from '@/components/shared/AppCard';
import { clamp, formatDate } from '@/lib/utils';
import { showSuccessToast } from '@/lib/toast';

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

const completedTaskStatuses = new Set([
  'completed',
  'reward_requested',
  'reward_approved',
  'reward_declined',
]);

const undoneTaskStatuses = new Set(['pending', 'in_progress']);

function buildDashboardFallbackSummary(
  metrics: ChildPerformanceMetric[],
  familyScore: number,
  strongestChildName?: string,
  needsSupportChildName?: string
) {
  const keepUp = metrics
    .filter((child) => child.overallScore >= 75)
    .map(
      (child) =>
        `- ${child.childName}: keep up the rhythm (${child.completionRate}% task completion, ${child.quizAverage || 0}% quiz average).`
    );

  const improve = metrics
    .filter((child) => child.overallScore < 70)
    .map(
      (child) =>
        `- ${child.childName}: reduce undone tasks (${child.tasksUndone}) and raise quiz consistency (${child.quizzesCompleted} completed quizzes).`
    );

  const keepUpSection = keepUp.length ? keepUp.join('\n') : '- All children are trending steadily right now.';
  const improveSection = improve.length ? improve.join('\n') : '- No critical dips. Maintain current coaching cadence.';

  return [
    `Overall snapshot: family score is ${familyScore}/100.`,
    strongestChildName ? `Strongest trend: ${strongestChildName}.` : '',
    needsSupportChildName ? `Needs support: ${needsSupportChildName}.` : '',
    '',
    'Keep up:',
    keepUpSection,
    '',
    'Improve next:',
    improveSection,
    '',
    '7-day focus:',
    '- Do one parent-child review per child with 2 concrete wins and 1 next action.',
    '- Prioritize pending/in-progress tasks with short daily check-ins.',
    '- Assign one targeted quiz follow-up where score is below 70%.',
  ]
    .filter(Boolean)
    .join('\n');
}

export default function DashboardPage() {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string>('');

  const summaryQuery = useDashboardSummary();
  const [taskCompletionQuery, gameTimeQuery, quizScoresQuery, learnProgressQuery] = useDashboardCharts();
  const { children, ...childrenQuery } = useChildren();
  const tasksQuery = useTasks();
  const quizzesQuery = useQuizzes();
  const askAI = useAskAI();

  const allQuizzes = useMemo(() => {
    const data = quizzesQuery.data;
    if (!data) return [];
    return [
      ...(data.hadith_quizzes ?? []),
      ...(data.prophet_quizzes ?? []),
      ...(data.quran_quizzes ?? []),
      ...(data.topic_quizzes ?? []),
    ];
  }, [quizzesQuery.data]);

  const childMetrics = useMemo<ChildPerformanceMetric[]>(() => {
    const tasks = tasksQuery.data ?? [];

    return children
      .map((child) => {
        const childTasks = tasks.filter((task) => task.assigned_to === child.id);
        const childQuizzes = allQuizzes.filter((quiz) => quiz.assigned_to === child.id);

        const tasksCompleted = childTasks.filter((task) => completedTaskStatuses.has(task.status)).length;
        const tasksUndone = childTasks.filter((task) => undoneTaskStatuses.has(task.status)).length;
        const pendingCount = childTasks.filter((task) => task.status === 'pending').length;
        const inProgressCount = childTasks.filter((task) => task.status === 'in_progress').length;
        const tasksTotal = childTasks.length;
        const completionRate = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

        const completedQuizScores = childQuizzes
          .filter((quiz) => quiz.status === 'completed' && typeof quiz.score === 'number')
          .map((quiz) => Number(quiz.score));
        const quizzesCompleted = completedQuizScores.length;
        const quizAverage = quizzesCompleted
          ? Number((completedQuizScores.reduce((sum, score) => sum + score, 0) / quizzesCompleted).toFixed(1))
          : 0;

        const volumeScore = clamp(tasksTotal * 9 + quizzesCompleted * 14, 0, 100);
        const reliabilityPenalty = Math.min(20, tasksUndone * 2.5);
        const baseQuizScore = quizzesCompleted ? quizAverage : 55;
        const overallScore = Math.round(
          clamp(completionRate * 0.5 + baseQuizScore * 0.35 + volumeScore * 0.15 - reliabilityPenalty, 0, 100)
        );

        let mostUndoneLabel = 'None';
        if (pendingCount > inProgressCount && pendingCount > 0) {
          mostUndoneLabel = `Pending (${pendingCount})`;
        } else if (inProgressCount > pendingCount && inProgressCount > 0) {
          mostUndoneLabel = `In progress (${inProgressCount})`;
        } else if (pendingCount > 0 || inProgressCount > 0) {
          mostUndoneLabel = `Pending/In progress (${tasksUndone})`;
        }

        return {
          childId: child.id,
          childName: child.name,
          tasksTotal,
          tasksCompleted,
          tasksUndone,
          pendingCount,
          inProgressCount,
          completionRate,
          quizzesCompleted,
          quizAverage,
          overallScore,
          mostUndoneLabel,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [allQuizzes, children, tasksQuery.data]);

  const familyScore = useMemo(() => {
    if (!childMetrics.length) return 0;
    return Math.round(
      childMetrics.reduce((sum, child) => sum + child.overallScore, 0) / childMetrics.length
    );
  }, [childMetrics]);

  const strongestChildName = childMetrics[0]?.childName;
  const needsSupportChildName = childMetrics[childMetrics.length - 1]?.childName;

  const aiPrompt = useMemo(() => {
    const payload = {
      family_score: familyScore,
      strongest_trend_child: strongestChildName ?? null,
      needs_support_child: needsSupportChildName ?? null,
      children: childMetrics.map((child) => ({
        name: child.childName,
        overall_score: child.overallScore,
        tasks: {
          total: child.tasksTotal,
          completed: child.tasksCompleted,
          undone: child.tasksUndone,
          pending: child.pendingCount,
          in_progress: child.inProgressCount,
          completion_rate_pct: child.completionRate,
          most_undone: child.mostUndoneLabel,
        },
        quizzes: {
          completed_count: child.quizzesCompleted,
          average_score_pct: child.quizAverage,
        },
      })),
    };

    return `
You are a Muslim family performance coach for parents.
Analyse this KPI snapshot and produce a concise dashboard coaching brief.

KPI JSON:
${JSON.stringify(payload, null, 2)}

Output format:
1) Overall Snapshot (2 short sentences)
2) Keep Up (bullet points, include child names and reasons)
3) Improve Next (bullet points, include child names and concrete actions)
4) 7-Day Focus Plan (3 practical steps)

Rules:
- Be specific, actionable, and balanced.
- Mention both strengths and weaknesses.
- Keep total response under 220 words.
`.trim();
  }, [childMetrics, familyScore, needsSupportChildName, strongestChildName]);

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

  const childInsightsLoading = childrenQuery.isLoading || tasksQuery.isLoading || quizzesQuery.isLoading;
  const childInsightsError = childrenQuery.isError || tasksQuery.isError || quizzesQuery.isError;

  const handleGenerateAISummary = () => {
    if (!childMetrics.length || askAI.isPending) return;

    askAI.mutate(aiPrompt, {
      onSuccess: ({ answer }) => {
        setAiSummary(answer.trim());
        setAiGeneratedAt(new Date().toISOString());
        showSuccessToast('AI summary ready', 'KPI coaching guidance has been generated.');
      },
      onError: () => {
        setAiSummary(
          buildDashboardFallbackSummary(
            childMetrics,
            familyScore,
            strongestChildName,
            needsSupportChildName
          )
        );
        setAiGeneratedAt(new Date().toISOString());
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Child-by-child performance intelligence with actionable coaching insights."
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

      {childInsightsLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartsSkeleton />
          <ChartsSkeleton />
        </div>
      ) : null}

      {childInsightsError ? (
        <EmptyState
          title="Child insights unavailable"
          description="We could not compute child-level KPIs right now. Retry to refresh."
          icon={<AlertTriangle size={28} />}
          action={
            <button
              type="button"
              onClick={() => {
                void childrenQuery.refetch();
                void tasksQuery.refetch();
                void quizzesQuery.refetch();
              }}
              className="rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
            >
              Retry child insights
            </button>
          }
        />
      ) : null}

      {!childInsightsLoading && !childInsightsError && !childMetrics.length ? (
        <EmptyState
          title="No child performance data yet"
          description="Add children and assign tasks/quizzes to start generating individual performance insights."
        />
      ) : null}

      {!childInsightsLoading && !childInsightsError && childMetrics.length ? (
        <>
          <ChildPerformanceOverview
            metrics={childMetrics}
            familyScore={familyScore}
            strongestChildName={strongestChildName}
            needsSupportChildName={needsSupportChildName}
          />

          <AppCard className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-panel-900">AI KPI coaching summary</h3>
                <p className="text-sm text-muted-foreground">
                  Generate practical recommendations using each child&apos;s task and quiz performance.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAISummary}
                disabled={askAI.isPending || !childMetrics.length}
                className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {askAI.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Generate AI summary
                  </>
                )}
              </button>
            </div>

            {aiSummary ? (
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-panel-800">{aiSummary}</p>
                {aiGeneratedAt ? (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Generated on {formatDate(aiGeneratedAt)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl border border-panel-200 bg-panel-50 p-3 text-sm text-muted-foreground">
                Generate an AI summary to get focused suggestions on which child needs support and what habits to keep reinforcing.
              </p>
            )}
          </AppCard>
        </>
      ) : null}

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
        <>
          <div>
            <h2 className="text-lg font-semibold text-panel-900">Family-wide trends</h2>
            <p className="text-sm text-muted-foreground">
              Global momentum signals across the household over time.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <TaskCompletionChart data={taskCompletionQuery.data?.data ?? []} />
            <GameTimeChart data={gameTimeQuery.data?.data ?? []} />
            <QuizScoresChart data={quizScoresQuery.data?.data ?? []} />
            <LearnProgressChart data={learnProgressQuery.data?.data ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
