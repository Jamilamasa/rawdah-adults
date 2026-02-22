'use client';

import { memo } from 'react';
import type { QuizScoreEntry } from '@/types';
import { AppCard } from '@/components/shared/AppCard';

interface QuizScoresChartProps {
  data: QuizScoreEntry[];
}

function QuizScoresChartInner({ data }: QuizScoresChartProps) {
  const grouped = data.reduce<
    Record<string, { date: string; hadith?: number; prophet?: number; quran?: number; topic?: number }>
  >((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { date: item.date };
    }
    acc[item.date][item.quiz_type] = Number(item.avg_score.toFixed(2));
    return acc;
  }, {});

  const chartData = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-panel-900">Quiz score trends</h3>
        <p className="text-sm text-muted-foreground">Average score by quiz type</p>
      </div>
      <div className="h-72 overflow-auto">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz submissions in this range.</p>
        ) : (
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <th className="pb-2">Date</th>
                <th className="pb-2">Hadith</th>
                <th className="pb-2">Prophet</th>
                <th className="pb-2">Quran</th>
                <th className="pb-2">Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-100">
              {chartData.map((entry) => (
                <tr key={entry.date}>
                  <td className="py-2 pr-4 font-medium text-panel-800">{entry.date}</td>
                  <td className="py-2 pr-4 text-blue-700">{entry.hadith ?? '—'}</td>
                  <td className="py-2 pr-4 text-amber-700">{entry.prophet ?? '—'}</td>
                  <td className="py-2 pr-4 text-emerald-700">{entry.quran ?? '—'}</td>
                  <td className="py-2 text-fuchsia-700">{entry.topic ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppCard>
  );
}

export const QuizScoresChart = memo(QuizScoresChartInner);
