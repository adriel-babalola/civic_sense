import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Activity, HelpCircle, Map, Menu, MessageCircle, SearchCheck, Users, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { CONFIG, FEATURES } from "../../config/config";
import { Button } from "../shared/Button";
import { Logo } from "./Logo";

/**
 * Primary navigation.
 *
 * The active route is marked with `aria-current` via NavLink, not only by
 * colour, so the current page is announced rather than merely tinted.
 */
const NAV = [
  { to: "/fact-check", label: "Fact-check", icon: SearchCheck },
  { to: "/politicians", label: "Politicians", icon: Users, flag: FEATURES.politicians },
  { to: "/map", label: "Incident map", icon: Map, flag: FEATURES.incidentMap },
  { to: "/live", label: "Live", icon: Activity, flag: FEATURES.liveFeed },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the mobile sheet on navigation — otherwise it covers the page you
  // just asked for.
  useEffect(() => setOpen(false), [location.pathname]);

  // The header gains a background once the page scrolls, so content passing
  // underneath never fights the logo for contrast.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the sheet.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const items = NAV.filter((item) => item.flag !== false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-20 transition-colors duration-200",
        scrolled || open ? "bg-surface/90 backdrop-blur-md" : "bg-surface/60 backdrop-blur-sm",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-surface to-transparent transition-opacity duration-300 sm:h-10",
          scrolled || open ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="cs-container relative flex h-full items-center justify-between gap-4">
        <Link
          to="/"
          className="rounded transition-opacity hover:opacity-80"
          aria-label="CivicSense, home"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-control px-2.5 py-2 text-base transition-colors",
                  isActive
                    ? "font-medium text-fg"
                    : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
                )
              }
            >
              <item.icon size={16} className="shrink-0 text-fg-faint" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={CONFIG.WHATSAPP.joinLink}
            variant="primary"
            size="md"
            className="hidden sm:inline-flex"
          >
            <MessageCircle size={14} aria-hidden="true" />
            Try WhatsApp
          </Button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-control text-fg-secondary transition-colors hover:bg-white/[0.04] hover:text-fg md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet. Collapses to zero height rather than unmounting, which
          keeps the header height stable and the transition interruptible. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-surface md:hidden"
      >
        <nav aria-label="Mobile" className="cs-container flex flex-col gap-0.5 py-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-control px-3 py-2.5 text-[0.9375rem] transition-colors",
                  isActive
                    ? "bg-card-active font-medium text-fg"
                    : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
                )
              }
            >
              <item.icon size={15} className="shrink-0 text-fg-faint" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
          <Button
            href={CONFIG.WHATSAPP.joinLink}
            variant="primary"
            size="md"
            className="mt-2 sm:hidden"
            fullWidth
          >
            <MessageCircle size={15} aria-hidden="true" />
            Try WhatsApp
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
