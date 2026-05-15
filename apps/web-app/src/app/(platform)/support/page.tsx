import Link from "next/link";

const demoSteps = [
  "Ticket ingested → Run created (taskClass: support.triage)",
  "Model router drafts reply (provider fallback chain)",
  "Human approval gate (Temporal — Phase 2 UI)",
  "Connector send + immutable audit events",
];

export default function SupportOpsPage() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
          Reference vertical
        </p>
        <h1 className="text-2xl font-semibold">Support operations</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          The canonical demo for this platform. One polished flow beats fifteen half-built
          modules.
        </p>
      </header>

      <ol className="space-y-2 text-sm text-[var(--muted)]">
        {demoSteps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="font-mono text-[var(--accent)]">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>

      <aside className="rounded-xl border border-[var(--border)] bg-black/20 p-4">
        <p className="mb-2 text-sm font-medium">Local demo</p>
        <p className="text-xs text-[var(--muted)]">
          Full curl walkthrough:{" "}
          <code className="text-[var(--accent)]">docs/verticals/SUPPORT_OPS.md</code>
        </p>
      </aside>

      <Link
        href="/agents"
        className="inline-flex text-sm text-[var(--accent)] hover:underline"
      >
        Configure agents →
      </Link>
    </section>
  );
}
