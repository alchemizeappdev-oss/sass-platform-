import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workforce",
  description: "Multi-tenant AI workforce automation platform",
};

const nav = [
  { href: "/agents", label: "Agents" },
  { href: "/workflows", label: "Workflows" },
  { href: "/automations/marketing", label: "Marketing" },
  { href: "/automations/crm", label: "CRM" },
  { href: "/support", label: "Support" },
  { href: "/codegen", label: "Codegen" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
      <aside className="w-56 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <p className="mb-6 text-sm font-semibold tracking-wide text-[var(--accent)]">
          AI Workforce
        </p>
        <nav className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)]/80 p-8 backdrop-blur">
        {children}
      </main>
    </div>
  );
}
