import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workforce — Operator Console",
  description: "Execution fabric for autonomous support operations",
};

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const primaryNav: NavItem[] = [
  { href: "/support", label: "Support Ops" },
  { href: "/agents", label: "Agents" },
  { href: "/workflows", label: "Workflows" },
];

const plannedNav: NavItem[] = [
  { href: "/automations/crm", label: "CRM", badge: "Soon" },
  { href: "/automations/marketing", label: "Marketing", badge: "Soon" },
  { href: "/codegen", label: "Codegen", badge: "Soon" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
          <aside className="w-60 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <p className="mb-1 text-sm font-semibold tracking-wide text-[var(--accent)]">
              AI Workforce
            </p>
            <p className="mb-6 text-xs text-[var(--muted)]">Execution fabric</p>

            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
              Reference vertical
            </p>
            <nav className="mb-6 flex flex-col gap-1 text-sm">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  emphasized={item.href === "/support"}
                />
              ))}
            </nav>

            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
              Planned modules
            </p>
            <nav className="mb-6 flex flex-col gap-1 text-sm opacity-60">
              {plannedNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            <Link
              href="/settings"
              className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
            >
              Settings
            </Link>
          </aside>
          <main className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)]/80 p-8 backdrop-blur">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({
  item,
  emphasized,
}: {
  item: NavItem;
  emphasized?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-[var(--text)] ${
        emphasized ? "bg-[var(--accent)]/10 text-[var(--text)]" : "text-[var(--muted)]"
      }`}
    >
      <span>{item.label}</span>
      {item.badge ? (
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{item.badge}</span>
      ) : null}
    </Link>
  );
}
