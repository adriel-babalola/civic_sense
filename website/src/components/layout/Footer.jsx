import { Link } from "react-router-dom";
import { Github, Mail, MessageCircle } from "lucide-react";
import { CONFIG } from "../../config/config";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { to: "/fact-check", label: "Check a claim" },
      { to: "/politicians", label: "Politician records" },
      { to: "/map", label: "Incident map" },
      { to: "/live", label: "Live verdicts" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { to: "/report", label: "Report misconduct" },
      { to: "/about", label: "About CivicSense" },
      { to: "/sources", label: "Where we check" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-sunken">
      <div className="cs-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
