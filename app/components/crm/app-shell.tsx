import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { LayoutGrid, Users } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

interface AppShellProps {
  children: ReactNode;
  /** Optional right-aligned action (e.g. quick-add button). */
  action?: ReactNode;
}

const NAV = [
  { to: "/", label: "Pipeline", icon: LayoutGrid },
  { to: "/contacts", label: "Contacts", icon: Users },
];

export function AppShell({ children, action }: AppShellProps) {
  const { config, loading } = useConfigurables();
  const location = useLocation();

  const appName = (!loading && config?.appName) || "SimpleCRM";
  const tagline = (!loading && config?.tagline) || "";
  const logoUrl =
    !loading && config?.logoUrl && !config.logoUrl.startsWith("FILL_")
      ? config.logoUrl
      : "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-9 w-9 rounded-[10px] object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                {appName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight">{appName}</span>
              {tagline ? (
                <span className="hidden text-[11px] text-[#64748B] sm:block">{tagline}</span>
              ) : null}
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full bg-[#F1F5F9] p-1">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                    active
                      ? "bg-white text-primary shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:pt-8">{children}</main>

      {action ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-6">
          <div className="pointer-events-auto">{action}</div>
        </div>
      ) : null}
    </div>
  );
}
