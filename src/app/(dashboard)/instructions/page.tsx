import { AppCard } from '@/components/shared/AppCard';
import { PageHeader } from '@/components/shared/PageHeader';

export const dynamic = 'force-static';

const corePages = [
  {
    title: 'Dashboard',
    details:
      'Household summary of members, tasks, games, and learning metrics. Use this first to spot where follow-up is needed.',
  },
  {
    title: 'Tasks',
    details:
      'Create one-time and recurring tasks, assign to a child, and connect optional rewards. Use statuses to track progress.',
  },
  {
    title: 'Rewards',
    details:
      'Define motivators that can be attached to tasks and quizzes so completion has clear, consistent outcomes.',
  },
  {
    title: 'People',
    details:
      'Add children and adults, set child game limits, set/update child age, and configure adult-relative permissions.',
  },
  {
    title: 'Quizzes',
    details:
      'Assign learning quizzes that include AI-generated lessons, flashcards, and longer quiz sets (15-40 questions) across hadith, quran, science, fun facts, and custom topics.',
  },
  {
    title: 'Requests',
    details:
      'Review child requests and respond with approval/decline and optional guidance.',
  },
  {
    title: 'Messages',
    details:
      'Private conversation threads between family members for coaching, reminders, and check-ins.',
  },
  {
    title: 'Notifications',
    details:
      'Timeline of assignment, completion, and request events. Use this as your operational alert stream.',
  },
  {
    title: 'Settings',
    details:
      'Manage account preferences and security settings for the adult portal.',
  },
];

const workflows = [
  'Start in People: create child accounts with username, password, game limit, and age.',
  'Create rewards before tasks so assignments can immediately include motivation.',
  'Assign tasks and learning quizzes after selecting the correct child profile.',
  'Track completion and respond quickly to reward requests and child requests.',
  'Use messages for contextual feedback instead of one-word approvals/declines.',
];

const troubleshooting = [
  'If quiz quality feels off for a child, confirm their age in People and update it there.',
  'If a child is missing in dropdowns, confirm they are active and have role "child".',
  'If an adult relative cannot access features, review permissions in People.',
  'If data looks stale, refresh the page and confirm API URL/environment values are correct.',
];

export default function InstructionsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Instructions"
        subtitle="Complete reference for the Rawdah adults interface and daily family-management workflow."
      />

      <AppCard className="space-y-3">
        <h2 className="text-lg font-semibold text-panel-900">Purpose</h2>
        <p className="text-sm leading-relaxed text-panel-700">
          The adults portal is the family command center. It is designed for parents and authorized
          adult relatives to coordinate Islamic learning (through quizzes), routines, rewards, communication, and
          accountability from one place.
        </p>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-lg font-semibold text-panel-900">Navigation Guide</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {corePages.map((page) => (
            <div key={page.title} className="rounded-xl border border-panel-200 bg-panel-50 p-3">
              <h3 className="text-sm font-semibold text-panel-900">{page.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-panel-700">{page.details}</p>
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-lg font-semibold text-panel-900">Recommended Daily Workflow</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-panel-700">
          {workflows.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-lg font-semibold text-panel-900">How Age Works Across Features</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-panel-700">
          <li>Child age is set when creating a child profile in People.</li>
          <li>Age can be edited later in People from the child card.</li>
          <li>Quiz assignment reads age from the child profile automatically.</li>
          <li>Quizzes page shows age as read-only to avoid mismatched profile data.</li>
        </ul>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-lg font-semibold text-panel-900">Troubleshooting</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-panel-700">
          {troubleshooting.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </AppCard>
    </div>
  );
}
