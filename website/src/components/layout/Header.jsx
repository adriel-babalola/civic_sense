import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  HelpCircle,
  Map,
  Menu,
  MessageCircle,
  SearchCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { CONFIG, FEATURES } from "../../config/config";
import { Button } from "../shared/Button";
import { Logo } from "./Logo";

/**
 * Primary navigation.
 *
 * The active route is marked with `aria-current` via NavLink, not only by colour,
 * so the current page is announced rather than merely tinted.
 *
 * STRUCTURE
 *
 * Four items sat flat before, and two of them were secondary: the incident map and
 * the live feed are places to look once you have decided to care, not the first
 * thing a first-time visitor needs. They now sit under one "Civic data" trigger,
 * which takes the bar from six entries to four and gives the directory the room it
 * needed. The trigger is a real button with `aria-expanded`, not a hover menu:
 * a hover-only dropdown cannot be opened by keyboard or on touch, and this one has
 * to work on a phone.
 */
const NAV = [
  { to: "/fact-check", label: "Fact-check", icon: SearchCheck },
  { to: "/politicians", label: "Politicians", icon: Users, flag: FEATURES.politicians },
  {
    label: "Civic data",
    icon: Activity,
    children: [
      { to: "/live", label: "Live feed", description: "Recent checks", icon: Activity, flag: FEATURES.liveFeed },
      { to: "/map", label: "Incident map", description: "Reports by state", icon: Map, flag: FEATURES.incidentMap },
    ],
  },
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
          {items.map((item) =>
            item.children ? (
              <NavDropdown key={item.label} item={item} />
            ) : (
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
            ),
          )}
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
          keeps the header height stable and the transition interruptible.

          The grouped section renders as an indented sub-list with its own label
          rather than as a nested accordion. An accordion inside a sheet that is
          itself a disclosure is two levels of tap to reach a page, and the two
          children are a flat list of links that need no collapsing at all. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-surface md:hidden"
      >
        <nav aria-label="Mobile" className="cs-container flex flex-col gap-0.5 py-3">
          {items.map((item) =>
            item.children ? (
              <div key={item.label} className="py-1">
                <p className="px-3 pb-1 pt-2 text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
                  {item.label}
                </p>
                {item.children
                  .filter((child) => child.flag !== false)
                  .map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 rounded-control px-3 py-2.5 text-[0.9375rem] transition-colors",
                          isActive
                            ? "bg-card-active font-medium text-fg"
                            : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
                        )
                      }
                    >
                      <child.icon size={15} className="shrink-0 text-fg-faint" aria-hidden="true" />
                      {child.label}
                    </NavLink>
                  ))}
              </div>
            ) : (
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
            ),
          )}
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

/**
 * Desktop dropdown for a group of routes.
 *
 * Opens on click, not on hover, and closes on Escape, on outside pointerdown and
 * on navigation. It is not a menu in the ARIA sense — these are links that happen
 * to be grouped, so the container is a plain div with a button controlling it, and
 * no `role="menu"` is claimed. Arrow-key roving focus would be the correct pattern
 * for a real menu and is deliberately absent rather than faked.
 */
function NavDropdown({ item }) {
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();
  const location = useLocation();

  const children = item.children.filter((child) => child.flag !== false);
  const isActive = children.some((child) => location.pathname.startsWith(child.to));

  // Navigating from inside the panel should close it.
  useEffect(() => setExpanded(false), [location.pathname]);

  useEffect(() => {
    if (!expanded) return undefined;

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setExpanded(false);
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
      // Return focus to the trigger, or Escape leaves focus on nothing and a
      // keyboard user has to tab the whole bar again to find their place.
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  if (!children.length) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={menuId}
        className={cn(
          "flex items-center gap-1.5 rounded-control px-2.5 py-2 text-base transition-colors",
          isActive || expanded
            ? "font-medium text-fg"
            : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
        )}
      >
        <item.icon size={16} className="shrink-0 text-fg-faint" aria-hidden="true" />
        {item.label}
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-fg-faint transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div
          id={menuId}
          className="cs-enter absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-card border border-line-strong bg-raised p-1.5 shadow-popover"
        >
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive: childActive }) =>
                cn(
                  "flex items-start gap-2.5 rounded-control px-2.5 py-2 transition-colors",
                  childActive ? "bg-card-active" : "hover:bg-card-hover",
                )
              }
            >
              {({ isActive: childActive }) => (
                <>
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-control border",
                      childActive
                        ? "border-brand-bright/30 bg-brand-bright/10 text-brand-bright"
                        : "border-line bg-surface text-fg-faint",
                    )}
                  >
                    <child.icon size={14} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        childActive ? "text-fg" : "text-fg-secondary",
                      )}
                    >
                      {child.label}
                    </span>
                    <span className="block text-2xs text-fg-faint">{child.description}</span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default Header;