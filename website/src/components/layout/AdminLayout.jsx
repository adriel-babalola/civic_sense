import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, Menu, Shield } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { LogoMark } from "./Logo";
import { LiveBadge } from "../shared/Badge";
import { clearAdminSession, isAdminAuthenticated, logoutAdmin } from "../../services/adminAuth";
import { fetchAdminStats } from "../../services/adminApi";

/**
 * Admin Console Root Layout.
 *
 * Enforces server-verified authentication boundary. Any unauthenticated visitor
 * is immediately redirected to /_admin/login.
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle unauthorized event
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAdminSession();
      navigate("/_admin/login", { replace: true, state: { from: location.pathname } });
    };
    window.addEventListener("cs:admin:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("cs:admin:unauthorized", handleUnauthorized);
  }, [navigate, location.pathname]);

  // Load telemetry stats on mount and refresh periodically
  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        if (mounted) setStats(data);
      } catch (err) {
        console.error("[AdminLayout] Stats fetch error:", err);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 45_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isAdminAuthenticated()) {
    return <Navigate to="/_admin/login" replace state={{ from: location.pathname }} />;
  }

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate("/_admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-fg antialiased">
      {/* Top sticky navigation bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0A0A0A]/90 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-fg-muted transition-colors hover:bg-white/[0.04] hover:text-white md:hidden"
          >
            <Menu size={17} />
          </button>

          <a href="/_admin" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#141414]">
              <LogoMark className="h-4.5 w-4.5 text-brand" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">CivicSense</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-2xs font-semibold text-brand-bright">
              <Shield size={10} className="shrink-0" />
              OPS
            </span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LiveBadge label="Operations Online" />
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <span>Public Site</span>
            <ExternalLink size={12} className="text-fg-faint" />
          </a>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={stats}
        onSignOut={handleSignOut}
      />

      {/* Main workspace container */}
      <main id="admin-main" className="px-4 pt-22 pb-16 sm:px-6 md:ml-64">
        <div className="mx-auto max-w-6xl">
          <Outlet context={{ stats, refreshStats: fetchAdminStats }} />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
