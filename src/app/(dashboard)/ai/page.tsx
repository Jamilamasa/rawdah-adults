'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useSessionForm } from '@/hooks/useSessionForm';
import { useAskAI } from '@/hooks/useAI';
import { showSuccessToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';

type AssistantMessage = {
  id: string;
  question: string;
  answer: string;
  created_at: string;
};

const starterPrompts = [
  'Create a weekly Islamic learning routine for a 9-year-old.',
  'How can I motivate my child to complete tasks without shouting?',
  'Give me 20 quiz topic ideas for this week.',
  'How do I balance screen time and Quran time?',
];

export default function AIPage() {
  const [form, setForm, clearForm] = useSessionForm('form:adults-ai', { question: '' });
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const askAI = useAskAI();

  const canSubmit = form.question.trim().length >= 2 && !askAI.isPending;

  const conversation = useMemo(
    () => [...messages].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [messages]
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = form.question.trim();
    if (question.length < 2 || askAI.isPending) return;

    setPendingQuestion(question);
    askAI.mutate(question, {
      onSuccess: ({ answer }) => {
        setMessages((prev) => [
          {
            id: `${Date.now()}`,
            question,
            answer,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setPendingQuestion(null);
        clearForm();
        showSuccessToast('AI response is ready', 'You can ask a follow-up question anytime.');
      },
      onError: () => {
        setPendingQuestion(null);
      },
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask parenting, learning, and planning questions and get instant help."
      />

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-panel-700">
          <Sparkles size={16} />
          Parent support assistant
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={form.question}
            onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
            rows={4}
            placeholder="Ask anything, for example: Build a 7-day learning plan for my child."
            className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm outline-none focus:border-panel-500 focus:ring-2 focus:ring-panel-200"
          />

          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, question: prompt }))}
                className="rounded-full border border-panel-300 bg-white px-3 py-1 text-xs font-medium text-panel-700 hover:bg-panel-100"
              >
                {prompt}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {askAI.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {askAI.isPending ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>
      </AppCard>

      {pendingQuestion ? (
        <AppCard className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Current request</p>
          <p className="text-sm text-panel-900">{pendingQuestion}</p>
          <div className="inline-flex items-center gap-2 text-sm text-panel-700">
            <Loader2 size={14} className="animate-spin" />
            Generating response...
          </div>
        </AppCard>
      ) : null}

      {conversation.length ? (
        <div className="space-y-3">
          {conversation.map((entry) => (
            <AppCard key={entry.id} className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Question</p>
                <p className="mt-1 text-sm text-panel-900">{entry.question}</p>
              </div>
              <div className="rounded-xl border border-panel-200 bg-panel-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">AI response</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-panel-800">{entry.answer}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Asked on {formatDate(entry.created_at)}</p>
            </AppCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot size={26} />}
          title="No AI conversations yet"
          description="Ask your first question to get tailored guidance for your family."
        />
      )}
    </div>
  );
}
