import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
          Reference vertical
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Autonomous support operations</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          One end-to-end path: triage → draft reply → human approval → send → audit.
          This demonstrates orchestration, provider routing, realtime events, and usage
          metering without CRM/marketing/codegen noise.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/support"
          className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Open Support Ops
        </Link>
        <a
          href="https://github.com/alchemizeappdev-oss/sass-platform-/blob/main/docs/ARCHITECTURE.md"
          className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          target="_blank"
          rel="noreferrer"
        >
          Execution diagram
        </a>
        <a
          href="https://github.com/alchemizeappdev-oss/sass-platform-/blob/main/docs/MANIFESTO.md"
          className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          target="_blank"
          rel="noreferrer"
        >
          Manifesto
        </a>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-black/20 p-4 font-mono text-xs text-[var(--muted)]">
        <p className="mb-2 text-[var(--text)]">Canonical unit: Run</p>
        <pre>{`Trigger → Run → Steps → Events → Artifacts`}</pre>
        <p className="mt-3">
          See <code className="text-[var(--accent)]">docs/PRIMITIVES.md</code> — terminology
          does not drift.
        </p>
      </div>
    </div>
  );
}
