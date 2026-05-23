import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: Compass },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? loc.pathname === "/"
                : loc.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PosterCard({
  cover,
  title,
  label,
  heat,
}: {
  cover: string;
  title: string;
  label?: string;
  heat?: string;
}) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <img
          src={cover}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {heat && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            🔥 {heat}
          </span>
        )}
        {label && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {label}
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 text-xs font-medium leading-tight">{title}</h3>
    </div>
  );
}
