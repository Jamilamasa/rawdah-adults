'use client';

import { memo } from 'react';
import type { LearnProgressEntry } from '@/types';
import { AppCard } from '@/components/shared/AppCard';

interface LearnProgressChartProps {
  data: LearnProgressEntry[];
}

function LearnProgressChartInner({ data }: LearnProgressChartProps) {
  const chartData = data.slice(0, 7).map((entry) => ({
    ...entry,
    progress: Number(entry.progress_pct.toFixed(1)),
  }));

  return (
    <AppCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-panel-900">Learn content completion</h3>
        <p className="text-sm text-muted-foreground">Top recent assignments progress</p>
      </div>

      <div className="h-72 space-y-3 overflow-auto">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No learn progress data yet.</p>
        ) : (
          chartData.map((entry) => (
            <div key={entry.content_id} className="space-y-1 rounded-xl border border-panel-200 bg-panel-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-panel-900">{entry.title}</p>
                <p className="text-xs font-semibold text-panel-700">{entry.progress}%</p>
              </div>
              <div className="h-2 rounded-full bg-panel-100">
                <div
                  className="h-2 rounded-full bg-panel-700"
                  style={{ width: `${entry.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {entry.completed_by}/{entry.total_assigned} completed
              </p>
            </div>
          ))
        )}
      </div>
    </AppCard>
  );
}

export const LearnProgressChart = memo(LearnProgressChartInner);
