'use client';

import { memo } from 'react';
import { CheckCircle2, ClipboardList, Gamepad2, ListChecks, Sparkles, Users2 } from 'lucide-react';
import type { DashboardSummary } from '@/types';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

function SummaryCardsInner({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Family members',
      value: summary.total_members,
      icon: Users2,
      accent: 'text-blue-700 bg-blue-100',
    },
    {
      label: 'Active tasks',
      value: summary.active_tasks,
      icon: ClipboardList,
      accent: 'text-amber-700 bg-amber-100',
    },
    {
      label: 'Completed tasks',
      value: summary.completed_tasks,
      icon: CheckCircle2,
      accent: 'text-emerald-700 bg-emerald-100',
    },
    {
      label: 'Pending requests',
      value: summary.pending_requests,
      icon: ListChecks,
      accent: 'text-indigo-700 bg-indigo-100',
    },
    {
      label: 'Game minutes',
      value: summary.total_game_minutes,
      icon: Gamepad2,
      accent: 'text-purple-700 bg-purple-100',
    },
    {
      label: 'Quizzes completed',
      value: summary.quizzes_completed,
      icon: Sparkles,
      accent: 'text-teal-700 bg-teal-100',
    },
  ];

  return (
    <div className="content-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="section-shell p-4 animate-stagger-in">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-panel-900">{card.value.toLocaleString()}</p>
              </div>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}>
                <Icon size={18} />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export const SummaryCards = memo(SummaryCardsInner);
