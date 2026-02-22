export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <section className="rounded-3xl border border-panel-200 bg-gradient-to-br from-panel-100 via-white to-amber-50 p-8 shadow-mellow sm:p-10">
          <p className="inline-flex rounded-full border border-panel-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-panel-600">
            Adults portal
          </p>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-panel-900 sm:text-5xl">
            Calm guidance for every child, every day.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-panel-700">
            Assign meaningful tasks, monitor learning milestones, and stay connected
            through respectful communication built for Muslim families.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-panel-200 bg-white/85 p-4">
              <h2 className="font-semibold text-panel-900">Role-aware access</h2>
              <p className="mt-1 text-sm text-panel-600">
                Invite trusted adults and control exactly what they can manage.
              </p>
            </article>
            <article className="rounded-2xl border border-panel-200 bg-white/85 p-4">
              <h2 className="font-semibold text-panel-900">Live family updates</h2>
              <p className="mt-1 text-sm text-panel-600">
                Stay informed as children complete tasks, quizzes, and requests.
              </p>
            </article>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
