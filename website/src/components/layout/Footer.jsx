import { Link } from "react-router-dom";
import { Github, Mail, MessageCircle } from "lucide-react";
import { CONFIG } from "../../config/config";
import { Logo } from "./Logo";

/**
 * Footer link groups.
 *
 * Grouped by what a visitor is trying to do rather than by product area, so the
 * two secondary civic surfaces sit under one "Civic data" heading here for the
 * same reason they share one dropdown in the header. Anything a visitor is
 * actively looking for — where the verdicts come from, how to reach us, what we
 * will not collect — is one click from the bottom of every page.
 */
const COLUMNS = [
  {
    heading: "Check something",
    links: [
      { to: "/fact-check", label: "Check a claim" },
      { to: "/live", label: "Live verification feed" },
      { to: "/sources", label: "Where we check" },
      { to: "/faq", label: "Questions and answers" },
    ],
  },
  {
    heading: "Civic data",
    links: [
      { to: "/politicians", label: "2027 presidential candidates" },
      { to: "/map", label: "Incident map" },
      { to: "/report", label: "Report what you saw" },
    ],
  },
  {
    heading: "About us",
    links: [
      { to: "/about", label: "About CivicSense" },
      { to: "/privacy", label: "Privacy policy" },
      { to: "/credits", label: "Photo and data credits" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-sunken">
      <div className="cs-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Identity column. The wordmark is a static brand lockup, not a
              disclosure: the group headings beside it already expand to reveal
              every link on desktop and mobile alike, so making the name toggle
              anything too would be a second, redundant way to reach the same
              list. Nothing here is hidden at any width. */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">
              Send a rumour to WhatsApp. Get the truth back. No app, no sign-up, no tracking.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href={CONFIG.WHATSAPP.joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn cs-btn-secondary cs-btn-sm"
              >
                <MessageCircle size={13} aria-hidden="true" />
                WhatsApp
              </a>
              <a
                href={`mailto:${CONFIG.CONTACT_EMAIL}`}
                className="cs-btn cs-btn-ghost cs-btn-sm"
              >
                <Mail size={13} aria-hidden="true" />
                Email
              </a>
              <a
                href={CONFIG.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn cs-btn-ghost cs-btn-sm"
              >
                <Github size={13} aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="cs-eyebrow">{column.heading}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="rounded text-sm text-fg-secondary transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-faint">
            © {year} CivicSense. Built in Nigeria.
          </p>
          <p className="text-xs text-fg-faint">
            Verdict is a research aid, not a legal judgement.{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-fg-secondary">
              Privacy
            </Link>
            {" · "}
            <Link to="/credits" className="underline underline-offset-2 hover:text-fg-secondary">
              Photo credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;