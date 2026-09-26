import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { Logo } from "./Logo";
import { LiveBadge } from "../shared/Badge";
import { isAuthenticated, signOut } from "../../services/auth";
import { useAsync } from "../../hooks/useAsync";
import { getHealth } from "../../services/api";
import { CONFIG } from "../../config/config";

/**
 * Admin shell.
 *
 * The guard is a redirect, not a render — an unauthenticated visitor never
 * receives the admin bundle's contents. See services/auth.js for why this is
 * an access gate and not a security boundary.
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState(() => isAuthenticated());
  const location = useLocation();

  // Health is polled slowly: it is a status indicator, not a live feed, and
  // there is no reason to hit the server on a 15s cadence.
  const { data: health } = useAsync((signal) => getHealth(signal), { intervalMs: 60_000 });

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const handleSignOut = () => {
    signOut();
    setSession(false);
  };

  return (
    <div className="min-h-dvh bg-surface">
      <a href="#admin-main" className="cs-skip-link">
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            className="flex h-9 w-9 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-white/[0.04] hover:text-fg md:hidden"
          >
            <Menu size={18} />
          </button>
          <a href="/" className="rounded transition-opacity hover:opacity-80">
            <Logo compact />
          </a>
          <span className="hidden text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint sm:inline">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          {health ? <LiveBadge /> : null}
          <a
            href={CONFIG.WHATSAPP.joinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            {CONFIG.WHATSAPP.display}
          </a>
        </div>
      </header>

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        health={health}
        onSignOut={handleSignOut}
      />

      <main id="admin-main" className="px-3 pt-20 pb-16 sm:px-5 md:ml-64">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
