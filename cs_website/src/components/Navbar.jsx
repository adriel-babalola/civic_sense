import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageSquare } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report Incident" },
  { to: "/map", label: "Incident Map" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-neutral-900/80">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">CS</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">CivicSense</h1>
          </div>
          <span className="text-sm text-neutral-500 hidden sm:inline border-l border-neutral-800 pl-3">
            Send a rumour. Get the truth back.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? "text-emerald-400 font-semibold" : "text-neutral-400 hover:text-neutral-200"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://wa.me/14155238886"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <MessageSquare size={14} />
            Try on WhatsApp
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-neutral-400 hover:text-white transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900/80">
          <div className="px-6 py-4 space-y-2">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-sm rounded-xl transition-colors ${isActive ? "text-emerald-400 bg-emerald-500/10" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl text-center mt-3"
              onClick={() => setOpen(false)}
            >
              Try on WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
