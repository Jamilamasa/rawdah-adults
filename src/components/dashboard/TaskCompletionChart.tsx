'use client';

import { memo } from 'react';
import type { DailyTaskCompletion } from '@/types';
import { AppCard } from '@/components/shared/AppCard';

interface TaskCompletionChartProps {
  data: DailyTaskCompletion[];
}

function TaskCompletionChartInner({ data }: TaskCompletionChartProps) {
  const maxValue = Math.max(...data.map((item) => item.completed), 1);

  return (
    <AppCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-panel-900">Task completion trend</h3>
        <p className="text-sm text-muted-foreground">Completed tasks per day</p>
      </div>
      <div className="h-72 space-y-2 overflow-auto pr-1">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completion data in this range.</p>
        ) : (
          data.map((item) => (
            <div key={item.date} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.date}</span>
                <span>{item.completed}</span>
              </div>
              <div className="h-2 rounded-full bg-panel-100">
                <div
                  className="h-2 rounded-full bg-panel-700"
                  style={{ width: `${(item.completed / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </AppCard>
  );
}

export const TaskCompletionChart = memo(TaskCompletionChartInner);
