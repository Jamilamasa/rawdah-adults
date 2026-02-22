'use client';

import { memo } from 'react';
import { AlertTriangle, Award, Brain, ClipboardCheck, ClipboardX, TrendingUp } from 'lucide-react';
import { AppCard } from '@/components/shared/AppCard';

export interface ChildPerformanceMetric {
  childId: string;
  childName: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksUndone: number;
  pendingCount: number;
  inProgressCount: number;
  completionRate: number;
  quizzesCompleted: number;
  quizAverage: number;
  overallScore: number;
  mostUndoneLabel: string;
}

interface ChildPerformanceOverviewProps {
  metrics: ChildPerformanceMetric[];
  familyScore: number;
  strongestChildName?: string;
  needsSupportChildName?: string;
}

function scoreClass(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 65) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

function ChildPerformanceOverviewInner({
  metrics,
  familyScore,
  strongestChildName,
  needsSupportChildName,
}: ChildPerformanceOverviewProps) {
  return (
    <div className="space-y-5">
      <AppCard className="overflow-hidden border-0 bg-gradient-to-br from-emerald-100 via-white to-amber-50">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200/70 bg-white/85 p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Family score</p>
            <p className="mt-2 text-3xl font-bold text-panel-900">{familyScore}</p>
            <p className="mt-1 text-xs text-panel-700">Combined signal from tasks, quizzes, and follow-through.</p>
          </div>

          <div className="rounded-2xl border border-blue-200/70 bg-white/85 p-4">
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <Award size={12} />
              Strongest trend
            </p>
            <p className="mt-2 text-lg font-semibold text-panel-900">{strongestChildName ?? 'N/A'}</p>
            <p className="mt-1 text-xs text-panel-700">Best overall score in the current performance snapshot.</p>
          </div>

          <div className="rounded-2xl border border-rose-200/70 bg-white/85 p-4">
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <AlertTriangle size={12} />
              Needs support
            </p>
            <p className="mt-2 text-lg font-semibold text-panel-900">{needsSupportChildName ?? 'N/A'}</p>
            <p className="mt-1 text-xs text-panel-700">Focus here first for higher consistency and completion quality.</p>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {metrics.map((metric) => (
          <AppCard key={metric.childId} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-panel-900">{metric.childName}</p>
                <p className="text-xs text-muted-foreground">Most undone: {metric.mostUndoneLabel}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreClass(metric.overallScore)}`}>
                Score {metric.overallScore}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-2.5">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Completion</p>
                <p className="mt-1 text-lg font-semibold text-panel-900">{metric.completionRate}%</p>
              </div>
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-2.5">
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <ClipboardCheck size={11} />
                  Completed
                </p>
                <p className="mt-1 text-lg font-semibold text-panel-900">{metric.tasksCompleted}</p>
              </div>
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-2.5">
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <ClipboardX size={11} />
                  Undone
                </p>
                <p className="mt-1 text-lg font-semibold text-panel-900">{metric.tasksUndone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Task outcomes</span>
                <span>{metric.tasksTotal} assigned</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-panel-100">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${metric.tasksTotal ? (metric.tasksCompleted / metric.tasksTotal) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-panel-100">
                <div
                  className="h-full bg-rose-400"
                  style={{
                    width: `${metric.tasksTotal ? (metric.tasksUndone / metric.tasksTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-2.5">
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <Brain size={11} />
                  Quiz average
                </p>
                <p className="mt-1 text-lg font-semibold text-panel-900">
                  {metric.quizzesCompleted ? `${metric.quizAverage}%` : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-2.5">
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <TrendingUp size={11} />
                  Quizzes done
                </p>
                <p className="mt-1 text-lg font-semibold text-panel-900">{metric.quizzesCompleted}</p>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      <AppCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-panel-900">Task completion vs undone by child</h3>
          <p className="text-sm text-muted-foreground">
            Quick comparison of follow-through quality across children.
          </p>
        </div>

        <div className="space-y-3">
          {metrics.map((metric) => {
            const total = Math.max(metric.tasksTotal, 1);
            const completedWidth = (metric.tasksCompleted / total) * 100;
            const undoneWidth = (metric.tasksUndone / total) * 100;

            return (
              <div key={`${metric.childId}-stack`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-panel-800">{metric.childName}</span>
                  <span className="text-muted-foreground">
                    {metric.tasksCompleted} completed • {metric.tasksUndone} undone
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-panel-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${completedWidth}%` }} />
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-panel-100">
                  <div className="h-full bg-rose-400" style={{ width: `${undoneWidth}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </AppCard>

      <AppCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-panel-900">Quiz performance by child</h3>
          <p className="text-sm text-muted-foreground">
            Average completed quiz score, with completion volume context.
          </p>
        </div>

        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={`${metric.childId}-quiz`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-panel-800">{metric.childName}</span>
                <span className="text-muted-foreground">
                  {metric.quizzesCompleted} quiz{metric.quizzesCompleted === 1 ? '' : 'zes'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-panel-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${metric.quizAverage}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {metric.quizzesCompleted ? `${metric.quizAverage}% average score` : 'No completed quizzes yet'}
              </p>
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
}

export const ChildPerformanceOverview = memo(ChildPerformanceOverviewInner);
