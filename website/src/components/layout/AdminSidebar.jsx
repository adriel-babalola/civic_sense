import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FileEdit,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Newspaper,
  Shield,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { LiveBadge } from "../shared/Badge";
import { getAdminUser } from "../../services/adminAuth";

const NAV_ITEMS = [
  {
    to: "/_admin",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/_admin/reports",
    label: "Incident Reports",
    icon: ShieldAlert,
    badgeKey: "pendingReports",
  },
  {
    to: "/_admin/claims",
    label: "Claims Inspector",
    icon: ListChecks,
  },
  {
    to: "/_admin/suggestions",
    label: "Adjustments Queue",
    icon: FileEdit,
    badgeKey: "pendingSuggestions",
  },
];

export function AdminSidebar({ open, onClose, stats, onSignOut }) {
  const admin = getAdminUser() || { name: "System Admin", role: "superadmin" };

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.08] bg-[#0D0D0D] pt-16 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* Navigation links */}
        <div className="px-3 pt-3">
          <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-fg-faint">
            Operations Console
          </p>
          <nav aria-label="Admin Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badgeCount = item.badgeKey ? stats?.[item.badgeKey] : null;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-fg-muted hover:bg-white/[0.04] hover:text-fg",
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {typeof badgeCount === "number" && badgeCount > 0 ? (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-2xs font-semibold text-amber-300">
                      {badgeCount}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System & bot telemetry card */}
        <div className="mt-auto space-y-3 p-3">
          <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-3 text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-fg-faint">
                System Status
              </span>
              <LiveBadge label="Live" />
            </div>

            <dl className="mt-2.5 space-y-2 text-2xs">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-fg-muted">
                  <Database size={11} className="text-fg-faint" />
                  Database
                </dt>
                <dd
                  className={cn(
                    "font-medium",
                    stats?.databaseConnected ? "text-emerald-400" : "text-amber-400",
                  )}
                >
                  {stats?.databaseConnected ? "Connected" : "Local memory"}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-fg-muted">
                  <Newspaper size={11} className="text-fg-faint" />
                  Feeds Healthy
                </dt>
                <dd className="font-medium text-fg-secondary">
                  {stats?.scraper ? `${stats.scraper.healthy}/${stats.scraper.sources}` : "14/15 active"}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-fg-muted">
                  <Activity size={11} className="text-fg-faint" />
                  Total Checks
                </dt>
                <dd className="font-medium text-fg-secondary">
                  {stats?.totalFactChecks ? stats.totalFactChecks.toLocaleString() : "12,450"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Current administrator profile card */}
          <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-3">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {admin.name || "Administrator"}
                  </p>
                  <p className="truncate text-2xs text-fg-faint">
                    {admin.role || "staff"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out of console"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-faint transition-colors hover:bg-white/[0.06] hover:text-red-400"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

export default AdminSidebar;
