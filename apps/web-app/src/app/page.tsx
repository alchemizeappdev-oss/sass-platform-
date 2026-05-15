import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Control plane</h1>
      <p className="max-w-2xl text-[var(--muted)]">
        Phase 1 MVP shell for agent runs, workflow orchestration, and tenant-scoped
        automation modules. Connect Supabase auth and the API gateway to exercise the
        full run lifecycle.
      </p>
      <Link
        href="/agents"
        className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        Open agents
      </Link>
    </div>
  );
}
