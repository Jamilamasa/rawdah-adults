export const dynamic = 'force-static';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, UsersRound } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden px-4 pb-16 pt-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-panel-700 text-xl text-white">
              🌿
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-panel-500">Rawdah</p>
              <h1 className="text-base font-bold text-panel-900">Parent Portal</h1>
            </div>
          </div>
          <Link
            href="/signin"
            className="rounded-xl border border-panel-300 bg-white px-4 py-2 text-sm font-semibold text-panel-700 hover:bg-panel-50"
          >
            Sign in
          </Link>
        </header>

        <section className="relative mt-14 rounded-3xl border border-panel-200 bg-gradient-to-br from-panel-100 via-white to-emerald-50 p-7 shadow-mellow sm:p-10 lg:p-14">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-emerald-200/50 blur-2xl" />

          <div className="relative grid gap-9 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900">
                <Sparkles size={14} /> Built for Muslim families
              </p>
              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-panel-900 sm:text-5xl">
                Guide your children with structured tasks, learning, and compassion.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-panel-700">
                The adults portal gives you one calm command center for assigning tasks,
                tracking progress, responding to requests, and supporting your children
                in a healthy Islamic learning routine.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-panel-700 px-5 py-3 text-sm font-bold text-white hover:bg-panel-800"
                >
                  Start your family space
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/signin"
                  className="rounded-xl border border-panel-300 bg-white px-5 py-3 text-sm font-semibold text-panel-700 hover:bg-panel-50"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="content-grid">
              <article className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-mellow">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-panel-100 text-panel-700">
                  <UsersRound size={18} />
                </div>
                <h3 className="mt-3 font-semibold text-panel-900">Family-first controls</h3>
                <p className="mt-1 text-sm text-panel-600">
                  Manage adults, children, permissions, and household routines in one place.
                </p>
              </article>

              <article className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-mellow">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-panel-100 text-panel-700">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="mt-3 font-semibold text-panel-900">Privacy by design</h3>
                <p className="mt-1 text-sm text-panel-600">
                  Sensitive child journaling remains private while adults receive only safe aggregates.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
