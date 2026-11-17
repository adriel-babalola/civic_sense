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
  ShieldCheck,
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

export function ElectionCalendar() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailState, setEmailState] = useState({ status: "idle", message: "" });
  const [copiedLink, setCopiedLink] = useState(false);

  // Target: Presidential & National Assembly Election Day 2027-01-16 08:30:00 WAT
  const [countdown, setCountdown] = useState({ days: 0 });

  useEffect(() => {
    const targetDate = new Date("2027-01-16T08:30:00+01:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        });
      } else {
        setCountdown({ days: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = ELECTION_CALENDAR_2027.filter((e) => {
    if (activeCategory === "all") return true;
    return e.category === activeCategory;
  });

  const handleEmailSubscribe = async (e) => {
    e.preventDefault();
    if (!emailInput || !/^\S+@\S+\.\S+$/.test(emailInput.trim())) {
      setEmailState({ status: "error", message: "Please enter a valid email address." });
      return;
    }

    setEmailState({ status: "loading", message: "Sending calendar to your inbox..." });

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/calendar/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), format: "ics_email", source: "web_calendar_modal" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver calendar.");
      }

      setEmailState({
        status: "success",
        message: "Email sent. Open the attached .ics file to add all milestones directly to your calendar.",
      });
      setEmailInput("");
    } catch (err) {
      setEmailState({
        status: "error",
        message: err.message || "Could not dispatch email. Please use direct download below.",
      });
    }
  };

  const handleShareCalendar = () => {
    if (navigator.share) {
      navigator.share({
        title: "2027 Nigeria Election Calendar",
        text: "Official 2027 Nigeria Election Timetable and statutory deadlines, verified by CivicSense.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      <Container className="pb-16 pt-6 sm:pt-8">
        <PageHeader
          eyebrow="Nigeria 2027 General Elections"
          title="Election Calendar"
          description="Statutory deadlines, voter registration cutoffs, and polling dates established under the 1999 Constitution and Electoral Act. Sync directly with Apple Calendar, Google Calendar, or download the universal file."
        />

        {/* Hero Card — Styled in Alignment with CivicSense Visual Identity */}
        <div className="cs-card relative overflow-hidden p-6 sm:p-8 bg-card border border-line">
          {/* Top Brand Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-line">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-control bg-brand/10 border border-brand/25 text-brand-bright">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold tracking-[0.12em] uppercase text-fg">
                CivicSense
              </span>
            </div>
            <span className="cs-eyebrow text-fg-muted">
              Statutory Timetable
            </span>
          </div>

          {/* Milestone Details */}
          <div className="pt-6">
            <p className="cs-eyebrow text-fg-muted mb-2">
              Next Major Polling Event
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-fg">
              Presidential & National Assembly Election Day
            </h2>
            <p className="mt-2 text-sm text-fg-secondary max-w-2xl leading-relaxed">
              Saturday, January 16, 2027 &bull; Polling units open nationwide from 08:30 to 14:30 WAT for accreditation and balloting.
            </p>
          </div>

          {/* Hairline Divider */}
          <div className="my-6 border-b border-line" />

          {/* Countdown & Metric Display */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="cs-eyebrow text-fg-muted mb-2">
                Countdown to Polling Day
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-7xl font-extrabold tracking-tight text-brand-bright font-mono">
                  {countdown.days}
                </span>
                <span className="text-base sm:text-xl font-bold uppercase tracking-wider text-fg">
                  Days Remaining
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={getWebcalUrl()}
                className="cs-btn cs-btn-primary cs-btn-md shadow-sm"
              >
                <CalendarIcon size={15} aria-hidden="true" />
                Add to Apple Calendar
              </a>

              <a
                href={getGoogleCalendarFeedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn cs-btn-secondary cs-btn-md"
              >
                <ExternalLink size={15} aria-hidden="true" />
                Add to Google Calendar
              </a>

              <a
                href={getIcsDownloadUrl()}
                download="nigeria-2027-elections.ics"
                className="cs-btn cs-btn-secondary cs-btn-md"
              >
                <Download size={15} aria-hidden="true" />
                Download .ics
              </a>

              <button
                type="button"
                onClick={() => {
                  setEmailState({ status: "idle", message: "" });
                  setEmailModalOpen(true);
                }}
                className="cs-btn cs-btn-secondary cs-btn-md"
              >
                <Mail size={15} aria-hidden="true" />
                Email Me Calendar
              </button>

              <button
                type="button"
                onClick={handleShareCalendar}
                className="cs-btn cs-btn-ghost cs-btn-md"
                aria-label="Share calendar link"
              >
                <Share2 size={15} aria-hidden="true" />
                {copiedLink ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-line pb-4">
          {CALENDAR_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={activeCategory === cat.key}
              className={cn(
                "rounded-control px-3.5 py-1.5 text-xs sm:text-sm transition-colors",
                activeCategory === cat.key
                  ? "bg-brand/15 text-brand-bright border border-brand/30 font-medium"
                  : "text-fg-secondary hover:text-fg hover:bg-card-hover border border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Milestones List */}
        <div className="mt-6 space-y-3">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className={cn(
                "cs-card cs-card-interactive p-5 sm:p-6 transition-colors border",
                event.isMajor
                  ? "border-line-strong bg-card"
                  : "border-line bg-card/60"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-brand-bright bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
                      {event.date}
                    </span>
                    <span className="text-fg-faint text-xs">&bull;</span>
                    <Badge tone={event.isMajor ? "brand" : "neutral"} size="sm">
                      {event.categoryLabel}
                    </Badge>
                    {event.timeStart && (
                      <span className="text-xs text-fg-muted inline-flex items-center gap-1 font-mono">
                        <Clock size={12} className="text-fg-faint" /> {event.timeStart.slice(0, 5)} - {event.timeEnd.slice(0, 5)} WAT
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-fg">
                    {event.title}
                  </h3>

                  <p className="text-sm text-fg-secondary leading-relaxed max-w-3xl">
                    {event.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-fg-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-fg-faint" /> {event.location}
                    </span>
                    {event.legalBasis && (
                      <span className="inline-flex items-center gap-1">
                        <Scale size={12} className="text-brand-bright/80" /> {event.legalBasis}
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="shrink-0 flex sm:flex-col items-center gap-2">
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-btn cs-btn-secondary cs-btn-sm"
                  >
                    <ExternalLink size={12} /> Google Cal
                  </a>
                  <a
                    href={getWebcalUrl()}
                    className="cs-btn cs-btn-secondary cs-btn-sm"
                  >
                    <CalendarIcon size={12} /> Apple Cal
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="cs-card mt-10 p-5 sm:p-6 border border-line bg-surface-raised text-xs text-fg-muted space-y-1.5">
          <p className="font-semibold text-fg text-sm">
            About CivicSense 2027 Election Data
          </p>
          <p className="leading-relaxed">
            All calendar dates are based on statutory provisions governing Nigerian general elections and the Electoral Act. As the Independent National Electoral Commission (INEC) issues supplementary notices or gazettes specific operational guidelines, this calendar is updated and automatically synced to all subscribed devices.
          </p>
        </div>
      </Container>

      {/* Email Delivery Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Get 2027 Calendar by Email"
            className="cs-card relative w-full max-w-md p-6 sm:p-7 border border-line-strong shadow-overlay bg-card"
          >
            <button
              type="button"
              onClick={() => setEmailModalOpen(false)}
              className="absolute right-4 top-4 rounded-control p-1 text-fg-muted hover:bg-card-hover hover:text-fg transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand/10 border border-brand/20 text-brand-bright">
                <CalendarIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-fg">Get 2027 Calendar by Email</h3>
                <p className="text-xs text-fg-muted">Includes universal .ics file & 1-tap calendar sync</p>
              </div>
            </div>

            {emailState.status === "success" ? (
              <div className="space-y-4 py-2">
                <div className="rounded-control border border-brand/25 bg-brand/10 p-3.5 text-brand-bright flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{emailState.message}</span>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={getIcsDownloadUrl()}
                    download="nigeria-2027-elections.ics"
                    className="cs-btn cs-btn-primary w-full py-2.5 text-xs font-semibold"
                  >
                    Direct Download .ics Now
                  </a>
                  <Button variant="secondary" onClick={() => setEmailModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubscribe} className="space-y-4">
                <p className="text-xs text-fg-secondary leading-relaxed">
                  Enter your email address to receive the verified 2027 Nigeria Election Calendar. Open the email on your phone or computer to import all 12 dates in one step.
                </p>

                <div>
                  <label htmlFor="calendar-email-input" className="cs-label">
                    Email address
                  </label>
                  <input
                    id="calendar-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. citizen@example.com"
                    required
                    className="cs-field"
                  />
                </div>

                {emailState.status === "error" && (
                  <div className="rounded-control border border-false/30 bg-false/10 p-3 text-xs text-false flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{emailState.message}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2.5">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={emailState.status === "loading"}
                    className="flex-1"
                  >
                    {emailState.status === "loading" ? "Sending..." : "Send Calendar"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEmailModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ElectionCalendar;
