'use client';

import { useMemo, useState } from 'react';
import { useSessionForm } from '@/hooks/useSessionForm';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { useChildren } from '@/hooks/useFamily';
import {
  useAssignHadithQuiz,
  useAssignProphetQuiz,
  useAssignQuranQuiz,
  useAssignTopicQuiz,
  useProphets,
  useQuranVerses,
  useQuizzes,
} from '@/hooks/useQuizzes';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, getAgeFromDateOfBirth, toTitleCase } from '@/lib/utils';
import type { TopicCategory } from '@/types';

type QuizListItem = {
  id: string;
  assigned_to: string;
  questions: { id: string }[];
  status: string;
  created_at: string;
  score?: number | null;
  type: 'hadith' | 'prophet' | 'quran' | 'topic';
  subject_label?: string;
};

export default function QuizzesPage() {
  const [showForm, setShowForm] = useState(false);
  const [quizType, setQuizType] = useState<'hadith' | 'prophet' | 'quran' | 'topic'>('hadith');

  const [hadithForm, setHadithForm, clearHadithForm] = useSessionForm('form:quiz-hadith', {
    assigned_to: '',
    difficulty: 'easy',
    memorize_until: '',
  });

  const [prophetForm, setProphetForm, clearProphetForm] = useSessionForm('form:quiz-prophet', {
    assigned_to: '',
    prophet_id: '',
  });

  const [quranForm, setQuranForm, clearQuranForm] = useSessionForm('form:quiz-quran', {
    assigned_to: '',
    verse_id: '',
  });

  const [topicForm, setTopicForm, clearTopicForm] = useSessionForm('form:quiz-topic', {
    assigned_to: '',
    category: 'science',
    topic: '',
    question_count: '20',
  });

  const { children } = useChildren();
  const quizzesQuery = useQuizzes();
  const prophetsQuery = useProphets();
  const versesQuery = useQuranVerses();

  const assignHadith = useAssignHadithQuiz();
  const assignProphet = useAssignProphetQuiz();
  const assignQuran = useAssignQuranQuiz();
  const assignTopic = useAssignTopicQuiz();

  const allQuizzes = useMemo<QuizListItem[]>(() => {
    const hadith = (quizzesQuery.data?.hadith_quizzes ?? []).map((item) => ({
      ...item,
      type: 'hadith' as const,
    }));
    const prophet = (quizzesQuery.data?.prophet_quizzes ?? []).map((item) => ({
      ...item,
      type: 'prophet' as const,
    }));
    const quran = (quizzesQuery.data?.quran_quizzes ?? []).map((item) => ({
      ...item,
      type: 'quran' as const,
    }));
    const topic = (quizzesQuery.data?.topic_quizzes ?? []).map((item) => ({
      ...item,
      type: 'topic' as const,
      subject_label: `${toTitleCase(item.category)} • ${item.topic}`,
    }));

    return [...hadith, ...prophet, ...quran, ...topic].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
  }, [quizzesQuery.data]);

  const childNameById = useMemo(() => {
    const map = new Map<string, string>();
    children.forEach((child) => map.set(child.id, child.name));
    return map;
  }, [children]);

  const childAgeById = useMemo(() => {
    const map = new Map<string, number | null>();
    children.forEach((child) => map.set(child.id, getAgeFromDateOfBirth(child.date_of_birth)));
    return map;
  }, [children]);

  const selectedChildId =
    quizType === 'hadith'
      ? hadithForm.assigned_to
      : quizType === 'prophet'
        ? prophetForm.assigned_to
        : quizType === 'quran'
          ? quranForm.assigned_to
          : topicForm.assigned_to;

  const selectedChildAge = selectedChildId ? (childAgeById.get(selectedChildId) ?? null) : null;

  const loadingAny =
    quizzesQuery.isLoading ||
    prophetsQuery.isLoading ||
    versesQuery.isLoading;

  const isAssigning =
    assignHadith.isPending || assignProphet.isPending || assignQuran.isPending || assignTopic.isPending;

  const resetForms = () => {
    clearHadithForm();
    clearProphetForm();
    clearQuranForm();
    clearTopicForm();
  };

  const handleAssign = (event: React.FormEvent) => {
    event.preventDefault();

    if (quizType === 'hadith') {
      assignHadith.mutate(
        {
          assigned_to: hadithForm.assigned_to,
          difficulty: hadithForm.difficulty,
          memorize_until: hadithForm.memorize_until
            ? new Date(hadithForm.memorize_until).toISOString()
            : undefined,
        },
        {
          onSuccess: () => {
            resetForms();
            setShowForm(false);
          },
        }
      );
      return;
    }

    if (quizType === 'prophet') {
      assignProphet.mutate(
        {
          assigned_to: prophetForm.assigned_to,
          prophet_id: prophetForm.prophet_id,
        },
        {
          onSuccess: () => {
            resetForms();
            setShowForm(false);
          },
        }
      );
      return;
    }

    if (quizType === 'topic') {
      const questionCount = Number(topicForm.question_count);
      assignTopic.mutate(
        {
          assigned_to: topicForm.assigned_to,
          category: topicForm.category as TopicCategory,
          topic: topicForm.topic.trim(),
          question_count: Number.isFinite(questionCount) ? questionCount : 20,
        },
        {
          onSuccess: () => {
            resetForms();
            setShowForm(false);
          },
        }
      );
      return;
    }

    assignQuran.mutate(
      {
        assigned_to: quranForm.assigned_to,
        verse_id: quranForm.verse_id,
      },
      {
        onSuccess: () => {
          resetForms();
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quizzes"
        subtitle="Assign AI learning quizzes with lessons, flashcards, and longer question sets."
        action={
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
          >
            <Plus size={16} />
            {showForm ? 'Close form' : 'Assign quiz'}
          </button>
        }
      />

      {showForm ? (
        <AppCard>
          <div className="mb-3 flex flex-wrap gap-2">
            {(['hadith', 'prophet', 'quran', 'topic'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setQuizType(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  quizType === type
                    ? 'bg-panel-700 text-white'
                    : 'border border-panel-300 bg-white text-panel-700 hover:bg-panel-100'
                }`}
              >
                {toTitleCase(type)}
              </button>
            ))}
          </div>

          <form onSubmit={handleAssign} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-panel-700">Child</label>
              <select
                required
                value={
                  quizType === 'hadith'
                    ? hadithForm.assigned_to
                    : quizType === 'prophet'
                      ? prophetForm.assigned_to
                      : quizType === 'quran'
                        ? quranForm.assigned_to
                        : topicForm.assigned_to
                }
                onChange={(event) => {
                  const value = event.target.value;
                  if (quizType === 'hadith') {
                    setHadithForm((prev) => ({ ...prev, assigned_to: value }));
                    return;
                  }
                  if (quizType === 'prophet') {
                    setProphetForm((prev) => ({ ...prev, assigned_to: value }));
                    return;
                  }
                  if (quizType === 'topic') {
                    setTopicForm((prev) => ({ ...prev, assigned_to: value }));
                    return;
                  }
                  setQuranForm((prev) => ({ ...prev, assigned_to: value }));
                }}
                className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
              >
                <option value="">Select child</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="group relative">
              <label className="mb-1 block text-sm font-medium text-panel-700">Child age</label>
              <div
                className="flex min-h-10 items-center rounded-xl border border-panel-300 bg-panel-50 px-3 text-sm text-panel-700"
                title="Edit age in people page."
              >
                {selectedChildId
                  ? selectedChildAge !== null
                    ? `${selectedChildAge} years`
                    : 'Not set'
                  : 'Select a child first'}
              </div>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-10 mt-1 rounded-md bg-panel-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Edit age in people page.
              </div>
            </div>

            {quizType === 'hadith' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Difficulty</label>
                  <select
                    value={hadithForm.difficulty}
                    onChange={(event) =>
                      setHadithForm((prev) => ({ ...prev, difficulty: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Memorize until</label>
                  <input
                    type="date"
                    value={hadithForm.memorize_until}
                    onChange={(event) =>
                      setHadithForm((prev) => ({ ...prev, memorize_until: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                </div>
              </>
            ) : null}

            {quizType === 'prophet' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Prophet</label>
                  <select
                    required
                    value={prophetForm.prophet_id}
                    onChange={(event) =>
                      setProphetForm((prev) => ({ ...prev, prophet_id: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select prophet</option>
                    {(prophetsQuery.data ?? []).map((prophet) => (
                      <option key={prophet.id} value={prophet.id}>
                        {prophet.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {quizType === 'quran' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Quran verse</label>
                  <select
                    required
                    value={quranForm.verse_id}
                    onChange={(event) =>
                      setQuranForm((prev) => ({ ...prev, verse_id: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select verse</option>
                    {(versesQuery.data ?? []).map((verse) => (
                      <option key={verse.id} value={verse.id}>
                        {verse.surah_name_en} ({verse.surah_number}:{verse.ayah_number})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {quizType === 'topic' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Category</label>
                  <select
                    value={topicForm.category}
                    onChange={(event) =>
                      setTopicForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  >
                    <option value="hadith">Hadith</option>
                    <option value="quran">Quran</option>
                    <option value="science">Science</option>
                    <option value="fun_facts">Fun facts</option>
                    <option value="general">General knowledge</option>
                    <option value="custom">Any parent topic</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Topic</label>
                  <input
                    required
                    value={topicForm.topic}
                    onChange={(event) =>
                      setTopicForm((prev) => ({ ...prev, topic: event.target.value }))
                    }
                    placeholder="e.g. Solar System, Honesty in Islam, Why we pray"
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-panel-700">Question count</label>
                  <input
                    type="number"
                    min={15}
                    max={40}
                    value={topicForm.question_count}
                    onChange={(event) =>
                      setTopicForm((prev) => ({ ...prev, question_count: event.target.value }))
                    }
                    className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Long quizzes only: minimum 15 questions.</p>
                </div>
              </>
            ) : null}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isAssigning}
                className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
              >
                {isAssigning ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Assign {toTitleCase(quizType)} Quiz
              </button>
            </div>
          </form>
        </AppCard>
      ) : null}

      {loadingAny ? (
        <InlineLoader label="Loading quizzes and references..." />
      ) : allQuizzes.length ? (
        <div className="space-y-3">
          {allQuizzes.map((quiz) => (
            <AppCard key={`${quiz.type}-${quiz.id}`} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-panel-900">
                      {quiz.type === 'topic'
                        ? `${toTitleCase(quiz.type)} learning quiz`
                        : `${toTitleCase(quiz.type)} quiz`}
                    </h3>
                    <span className="rounded-full bg-panel-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-panel-700">
                      {toTitleCase(quiz.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Child: {childNameById.get(quiz.assigned_to) ?? 'Unknown'}</span>
                    <span>Questions: {quiz.questions.length}</span>
                    {quiz.type === 'topic' ? (
                      <span>Topic: {quiz.subject_label}</span>
                    ) : null}
                    <span>Assigned: {formatDate(quiz.created_at)}</span>
                    {quiz.score !== undefined && quiz.score !== null ? <span>Score: {quiz.score}%</span> : null}
                  </div>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No quizzes assigned"
          description="Assign your first learning quiz to start lesson + flashcard + quiz flow in the kids app."
        />
      )}
    </div>
  );
}
