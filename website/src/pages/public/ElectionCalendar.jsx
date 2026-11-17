import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  MapPin,
  Scale,
  X,
  Share2,
} from "lucide-react";
import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Badge } from "../../components/shared/Badge";
import {
  ELECTION_CALENDAR_2027,
  CALENDAR_CATEGORIES,
  getWebcalUrl,
  getIcsDownloadUrl,
  getGoogleCalendarFeedUrl,
  getGoogleCalendarUrl,
} from "../../data/electionCalendar2027";
import { CONFIG } from "../../config/config";
import { cn } from "../../utils/cn";

/** Polling day for the 2027 presidential election. */
const TARGET_MS = new Date("2027-01-16T08:30:00+01:00").getTime();

function CountdownUnit({ value, label, accent = false }) {
  return (
    <div className="flex min-w-[58px] flex-col items-center rounded-control border border-line bg-surface px-3 py-2 sm:min-w-[68px]">
      <span
        className={cn(
          "font-mono text-xl font-semibold tabular-nums sm:text-2xl",
          accent ? "text-brand-bright" : "text-fg",
        )}
      >
        {value}
      </span>
      <span className="text-2xs uppercase tracking-[0.08em] text-fg-faint">{label}</span>
    </div>
  );
}

export function ElectionCalendar() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailState, setEmailState] = useState({ status: "idle", message: "" });
  const [copiedLink, setCopiedLink] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const update = () => {
      const difference = TARGET_MS - Date.now();
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(difference / 86400000),
        hours: Math.floor((difference / 3600000) % 24),
        mins: Math.floor((difference / 60000) % 60),
        secs: Math.floor((difference / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents =
    activeCategory === "all"
      ? ELECTION_CALENDAR_2027
      : ELECTION_CALENDAR_2027.filter((event) => event.category === activeCategory);

  const handleEmailSubscribe = async (event) => {
    event.preventDefault();
    if (!emailInput || !/^\S+@\S+\.\S+$/.test(emailInput.trim())) {
      setEmailState({ status: "error", message: "Please enter a valid email address." });
      return;
    }

    setEmailState({ status: "loading", message: "Sending the calendar to your inbox..." });
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/calendar/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), format: "ics_email", source: "web_calendar_modal" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to deliver the calendar.");
      setEmailState({
        status: "success",
        message: "Sent. Check your inbox and open the attached .ics file to add all dates at once.",
      });
      setEmailInput("");
    } catch (err) {
      setEmailState({
        status: "error",
        message: err.message || "Could not send the email. Use the direct download instead.",
      });
    }
  };

  const handleShareCalendar = () => {
    if (navigator.share) {
      navigator.share({
        title: "2027 Nigeria Election Calendar",
        text: "All the 2027 Nigeria election milestones, ready to add to your calendar.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openEmailModal = () => {
    setEmailState({ status: "idle", message: "" });
    setEmailModalOpen(true);
  };

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Nigeria 2027 general elections"
        title="Election calendar"
        description="Statutory deadlines, registration cutoffs and polling dates drawn from the 1999 Constitution and the Electoral Act. Add them to your phone, Google Calendar or Apple Calendar."
      />

      {/* Countdown */}
      <div className="cs-card mt-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-brand-bright">
              <Clock size={12} aria-hidden="true" /> Next major milestone
            </span>
            <h2 className="mt-2 text-lg font-semibold text-fg sm:text-xl">
              Presidential and National Assembly election day
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              Saturday, 16 January 2027. Polls open 8:30 AM to 2:30 PM WAT, nationwide.
            </p>
          </div>

          <div className="flex items-center gap-2" role="timer" aria-label="Time until election day">
            <CountdownUnit value={countdown.days} label="Days" />
            <CountdownUnit value={String(countdown.hours).padStart(2, "0")} label="Hours" accent />
            <CountdownUnit value={String(countdown.mins).padStart(2, "0")} label="Mins" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-5">
          <Button as="a" href={getGoogleCalendarFeedUrl()} target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
            <CalendarIcon size={14} aria-hidden="true" />
            Add to Google Calendar
          </Button>
          <Button as="a" href={getWebcalUrl()} variant="secondary" size="sm">
            <CalendarIcon size={14} aria-hidden="true" />
            Add to Apple Calendar
          </Button>
          <Button as="a" href={getIcsDownloadUrl()} download="nigeria-2027-elections.ics" variant="secondary" size="sm">
            <Download size={14} aria-hidden="true" />
            Download .ics
          </Button>
          <Button variant="ghost" size="sm" onClick={openEmailModal}>
            <Mail size={14} aria-hidden="true" />
            Email me the calendar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShareCalendar} className="sm:ml-auto">
            <Share2 size={13} aria-hidden="true" />
            {copiedLink ? "Link copied" : "Share"}
          </Button>
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {CALENDAR_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            aria-pressed={activeCategory === category.key}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === category.key
                ? "border-brand-bright/40 bg-brand-bright/10 text-brand-bright"
                : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-5 space-y-3">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className={cn(
              "cs-card p-4 sm:p-5",
              event.isMajor && "border-brand-bright/30",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-brand-bright">{event.date}</span>
                  <Badge tone={event.isMajor ? "brand" : "neutral"} size="sm">
                    {event.categoryLabel}
                  </Badge>
                  {event.timeStart ? (
                    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
                      <Clock size={11} aria-hidden="true" />
                      {event.timeStart.slice(0, 5)} to {event.timeEnd.slice(0, 5)} WAT
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-2 text-base font-semibold leading-snug text-fg">{event.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">{event.description}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} className="text-fg-faint" aria-hidden="true" />
                    {event.location}
                  </span>
                  {event.legalBasis ? (
                    <span className="inline-flex items-center gap-1">
                      <Scale size={11} className="text-fg-faint" aria-hidden="true" />
                      {event.legalBasis}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0 sm:self-center">
                <Button as="a" href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                  Google Cal
                  <ExternalLink size={12} aria-hidden="true" />
                </Button>
                <Button as="a" href={getWebcalUrl()} variant="ghost" size="sm">
                  Apple Cal
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="cs-card mt-8 p-5">
        <h2 className="text-sm font-semibold text-fg">About this calendar</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
          Dates follow the constitutional provisions governing Nigerian general elections and the
          Electoral Act. When INEC issues a supplementary notice or gazette, this calendar is updated
          and re-syncs to every subscribed device.
        </p>
      </div>

      {/* Email modal */}
      {emailModalOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Get the calendar by email"
            className="cs-enter w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-control border border-brand-bright/25 bg-brand-bright/10 p-2 text-brand-bright">
                <CalendarIcon size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-fg">Get the calendar by email</h3>
                <p className="mt-0.5 text-xs text-fg-muted">Includes a universal .ics file for one-tap sync.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                aria-label="Close"
                className="rounded-control border border-line p-1.5 text-fg-muted transition-colors hover:text-fg"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {emailState.status === "success" ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2.5 rounded-control border border-verified/25 bg-verified/10 p-3 text-sm text-verified">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{emailState.message}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button as="a" href={getIcsDownloadUrl()} download="nigeria-2027-elections.ics" variant="secondary" className="w-full justify-center">
                    <Download size={14} aria-hidden="true" />
                    Download .ics now
                  </Button>
                  <Button variant="ghost" onClick={() => setEmailModalOpen(false)} className="w-full justify-center">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubscribe} className="mt-4 space-y-3">
                <p className="text-sm leading-relaxed text-fg-secondary">
                  Enter your email to receive the full 2027 election calendar. Open it on your phone to
                  add all dates at once.
                </p>

                <div>
                  <label htmlFor="calendar-email" className="cs-label">
                    Your email address
                  </label>
                  <input
                    id="calendar-email"
                    type="email"
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-brand-bright focus:outline-none"
                  />
                </div>

                {emailState.status === "error" ? (
                  <div className="flex items-center gap-2 rounded-control border border-false/25 bg-false/10 p-2.5 text-xs text-false">
                    <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
                    <span>{emailState.message}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 pt-1">
                  <Button type="submit" variant="primary" disabled={emailState.status === "loading"} className="flex-1 justify-center">
                    {emailState.status === "loading" ? "Sending..." : "Send calendar"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setEmailModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </Container>
  );
}

export default ElectionCalendar;
