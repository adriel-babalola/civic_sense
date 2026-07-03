import { NavLink } from "react-router-dom";
import { LayoutDashboard, MapPin, Flag, MessageSquare, Activity, Shield, User, Settings, LogOut } from "lucide-react";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Ask Kratos", icon: MessageSquare },
  { to: "/conflict", label: "Conflict Tracker", icon: MapPin },
  { to: "/reports", label: "Anonymous Reports", icon: Flag },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
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
              onClick={onClose}
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

        {/* WhatsApp QR + Join Info */}
        <div className="px-4 py-2">
          <div className="bg-[#141414] rounded-lg border border-[#1E1E1E] p-2 space-y-1.5">
            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider text-center">
              Try the Bot
            </p>
            <img
              src="/image.png"
              alt="WhatsApp QR"
              className="w-full max-w-[130px] mx-auto rounded"
            />
            <p className="text-[10px] text-[#A1A1AA] text-center leading-snug">
              Send to{" "}
              <span className="text-white font-medium">+1 415 523 8886</span>
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px]">
              <span className="text-[#6B7280]">code</span>
              <code className="px-1 py-0.5 bg-[#1E1E1E] rounded text-[#22C55E] font-mono">
                join angle-building
              </code>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#1E1E1E]">
          <div className="bg-[#141414] rounded-lg border border-[#1E1E1E] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Bot Status</span>
              <span className="flex items-center gap-1 text-[10px] text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <Activity size={11} className="text-[#22C55E]" />
                Claims Today
              </span>
              <span className="text-[#A1A1AA] font-medium">23</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <Flag size={11} className="text-[#F59E0B]" />
                Pending Reports
              </span>
              <span className="text-[#A1A1AA] font-medium">4</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3.5 border-t border-[#1E1E1E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                <User size={16} strokeWidth={1.5} className="text-[#6B7280]" />
              </div>
              <p className="text-sm font-medium text-white/90">Guest</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-[#6B7280] hover:text-[#A1A1AA] hover:bg-white/[0.05] transition-colors">
                <Settings size={16} strokeWidth={1.5} />
              </button>
              <button className="p-2 rounded-lg text-[#6B7280] hover:text-[#A1A1AA] hover:bg-white/[0.05] transition-colors">
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
