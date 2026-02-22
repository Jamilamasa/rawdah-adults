import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-mellow">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-panel-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-panel-900">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page does not exist or you may not have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-xl bg-panel-700 px-4 py-2 text-sm font-semibold text-white hover:bg-panel-800"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
