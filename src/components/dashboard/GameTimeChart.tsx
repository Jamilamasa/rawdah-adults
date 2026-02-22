'use client';

import { memo } from 'react';
import type { DailyGameTime } from '@/types';
import { AppCard } from '@/components/shared/AppCard';

interface GameTimeChartProps {
  data: DailyGameTime[];
}

function GameTimeChartInner({ data }: GameTimeChartProps) {
  const points = data.map((item) => item.minutes);
  const max = Math.max(...points, 1);
  const width = 600;
  const height = 220;

  const polyline = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (item.minutes / max) * (height - 12);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <AppCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-panel-900">Game time</h3>
        <p className="text-sm text-muted-foreground">Total minutes played each day</p>
      </div>
      <div className="h-72 overflow-x-auto">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No game session data in this range.</p>
        ) : (
          <svg viewBox={`0 0 ${width} ${height + 30}`} className="h-full w-full min-w-[540px]">
            <rect x="0" y="0" width={width} height={height} fill="#eef6f1" rx="10" />
            <polyline
              fill="none"
              stroke="#2f6f54"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polyline}
            />
            {data.map((item, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * width;
              const y = height - (item.minutes / max) * (height - 12);
              return (
                <g key={item.date}>
                  <circle cx={x} cy={y} r="4" fill="#2f6f54" />
                  <text x={x} y={height + 16} textAnchor="middle" fontSize="11" fill="#4f6b5d">
                    {item.date}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </AppCard>
  );
}

export const GameTimeChart = memo(GameTimeChartInner);
