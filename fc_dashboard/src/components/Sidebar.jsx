import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, LayoutDashboard, MapPin, Flag, MessageSquare, User, Settings, LogOut } from "lucide-react";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Ask Kratos", icon: MessageSquare },
  { to: "/conflict", label: "Conflict Tracker", icon: MapPin },
  { to: "/reports", label: "Anonymous Reports", icon: Flag },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-[58px] left-4 z-50 md:hidden bg-[#141414] p-2.5 rounded-xl border border-[#1E1E1E]"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0A0A] border-r border-[#1E1E1E] flex flex-col transition-transform duration-200 pt-14 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <nav className="flex-1 p-3 space-y-0.5 pt-5">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-[#1E1E1E] text-white font-medium"
                    : "text-[#6B7280] hover:text-[#A1A1AA] hover:bg-white/[0.03]"
                }`
              }
            >
              <l.icon size={16} strokeWidth={1.5} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-[#1E1E1E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                <User size={13} className="text-[#6B7280]" />
              </div>
              <p className="text-sm text-white">Guest</p>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 rounded-md text-[#6B7280] hover:text-[#A1A1AA] hover:bg-white/[0.03] transition-colors">
                <Settings size={14} />
              </button>
              <button className="p-1.5 rounded-md text-[#6B7280] hover:text-[#A1A1AA] hover:bg-white/[0.03] transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
