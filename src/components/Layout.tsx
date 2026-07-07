import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Network,
  LayoutTemplate,
  Users,
  PlayCircle,
  Eye,
  Home,
  FileText,
  MessageSquareText,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dialogue coach", icon: MessageSquareText, end: true },
  { to: "/overview", label: "UX overview", icon: Home },
  { to: "/audit", label: "UX audit", icon: ClipboardList },
  { to: "/roadmap", label: "Action roadmap", icon: FileText },
  { to: "/ia", label: "Information architecture", icon: Network },
  { to: "/hero", label: "Hero & CTA", icon: LayoutTemplate },
  { to: "/segments", label: "Segment pages", icon: Users },
  { to: "/demo", label: "Demo structure", icon: PlayCircle },
  { to: "/prototype/home", label: "Prototype — home", icon: Eye },
  { to: "/prototype/segment", label: "Prototype — segment", icon: Eye },
];

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-sidebar-border px-5 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
            Dialogue Lab
          </div>
          <div className="mt-1 text-base font-semibold text-sidebar-foreground">
            BrainTrainings Academy
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Educational conversation tool. Not a medical device. No diagnosis, no medical advice.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="text-sm font-semibold">BT Academy — Dialogue Lab</div>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
