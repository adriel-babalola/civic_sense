import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, LayoutDashboard, MessageSquare, MapPin, Flag, Shield } from "lucide-react";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Ask Kratos", icon: MessageSquare },
  { to: "/conflict", label: "Conflict Tracker", icon: MapPin },
  { to: "/reports", label: "Anonymous Reports", icon: Flag },
];

export default function Sidebar({ stats }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden glass-card p-2.5 rounded-xl"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-sidebar border-r border-white/[0.04] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-white/[0.04]">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="gradient-text">CivicSense</span>
          </h1>
          <p className="text-[11px] text-gray-600 mt-1.5 tracking-wide uppercase">
            Kratos fact-check engine
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium shadow-[inset_0_0_0_1px_rgba(0,200,83,0.15)]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                }`
              }
            >
              <l.icon size={17} strokeWidth={1.5} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5 text-[11px] text-gray-600">
            <Shield size={13} />
            <span>{stats} claims fact-checked</span>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
