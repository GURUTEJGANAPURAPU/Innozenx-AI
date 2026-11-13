import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  BrainCircuit,
  FolderKanban,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { Logo } from "./logo";
import { useMissions } from "@/hooks/use-missions";
import { deleteMission } from "@/lib/missions-store";

const NAV = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard, exact: true },
  { label: "AI Mission", to: "/app", icon: Sparkles, exact: true },
  { label: "Agents", to: "/app/agents", icon: Users },
  { label: "Memory", to: "/app/memory", icon: BrainCircuit },
  { label: "Projects", to: "/app/memory", icon: FolderKanban },
  { label: "Settings", to: "/app/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const missions = useMissions();

  return (
    <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link to="/"><Logo /></Link>
      </div>

      <div className="px-3">
        <Link
          to="/app"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_30px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)] transition-transform hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" /> New mission
        </Link>
      </div>

      <nav className="mt-5 px-2">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 flex-1 overflow-y-auto px-2 scrollbar-thin">
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
          <span>Recent Missions</span>
          <span className="text-muted-foreground/60">{missions.length}</span>
        </div>
        {missions.length === 0 ? (
          <div className="mx-3 rounded-lg border border-dashed border-border px-3 py-4 text-[12px] text-muted-foreground/70">
            No missions yet. Launch your first one from the workspace.
          </div>
        ) : (
          <ul className="space-y-0.5 pb-6">
            {missions.map((m) => {
              const active = pathname === `/app/${m.id}`;
              return (
                <li key={m.id} className="group relative">
                  <Link
                    to="/app/$missionId"
                    params={{ missionId: m.id }}
                    className={`block rounded-md px-3 py-2 pr-9 text-[13px] transition-colors ${
                      active
                        ? "bg-white/[0.06] text-foreground"
                        : "text-foreground/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="truncate">{m.title}</div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {statusLabel(m.status)} · {new Date(m.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete mission"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteMission(m.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/60 opacity-0 transition hover:bg-white/[0.06] hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg border border-border bg-surface/60 p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/90">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" /> System online
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            
          </div>
        </div>
      </div>
    </aside>
  );
}

function statusLabel(s: string) {
  if (s === "complete") return "Complete";
  if (s === "running") return "In progress";
  if (s === "planning") return "Planning";
  if (s === "error") return "Failed";
  return s;
}
