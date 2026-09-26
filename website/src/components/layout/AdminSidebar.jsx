import { NavLink } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { CONFIG } from "../../config/config";
import { LiveBadge } from "../shared/Badge";

const LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/reports", label: "Reports queue", icon: ShieldAlert },
  { to: "/admin/feed", label: "Fact-check feed", icon: ListChecks },
  { to: "/admin/politicians", label: "Politicians", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open, onClose, health, onSignOut }) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface pt-16 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <nav aria-label="Admin" className="flex-1 space-y-0.5 p-3">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-control px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-card-active font-medium text-fg"
                    : "text-fg-muted hover:bg-white/[0.03] hover:text-fg-secondary",
                )
              }
            >
              <link.icon size={15} strokeWidth={1.75} aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line p-3">
          <div className="cs-card space-y-2 p-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
                Bot status
              </span>
              {health ? <LiveBadge label="Live" /> : <span className="text-2xs text-fg-faint">unknown</span>}
            </div>
            <dl className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-fg-muted">Database</dt>
                <dd className={cn("font-medium", health?.db ? "text-verified" : "text-misleading")}>
                  {health?.db ? "connected" : "offline"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-fg-muted">Articles</dt>
                <dd className="font-medium text-fg-secondary">
                  {health?.articles?.toLocaleString() ?? "n/a"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-fg-muted">Feeds healthy</dt>
                <dd className="font-medium text-fg-secondary">
                  {health?.scraper ? `${health.scraper.healthy}/${health.scraper.sources}` : "n/a"}
                </dd>
              </div>
            </dl>
            {health?.scraper?.lastSyncAt ? (
              <p className="text-2xs text-fg-faint">
                Last sync{" "}
                {new Date(health.scraper.lastSyncAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
          </div>

          <a
            href={CONFIG.WHATSAPP.joinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cs-btn cs-btn-secondary cs-btn-sm w-full"
          >
            Open WhatsApp bot
          </a>

          <button
            type="button"
            onClick={onSignOut}
            className="cs-btn cs-btn-ghost cs-btn-sm w-full"
          >
            <LogOut size={13} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

export default AdminSidebar;
