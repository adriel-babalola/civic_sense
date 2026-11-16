import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  MapPin,
  Scale,
  X,
  Share2,
} from "lucide-react";
import { Container, PageHeader, Section } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Badge } from "../../components/shared/Badge";
import {
  ELECTION_CALENDAR_2027,
  CALENDAR_CATEGORIES,
  getWebcalUrl,
  getIcsDownloadUrl,
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

  // Target: Presidential Election Day 2027-01-16
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date("2027-01-16T08:30:00+01:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
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
        message: "Email sent! Check your inbox. If on an iPhone, tap the attached .ics to add all dates in one click.",
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
        text: "Download and sync all verified 2027 Nigeria Election milestones to your iPhone, Google Calendar, or PC.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      <Container className="pb-16 pt-6 sm:pt-8">
        <PageHeader
          eyebrow="Nigeria 2027 General Elections"
          title="Official Election Calendar & Timetable"
          description="Statutory deadlines, voter registration cutoffs, and polling dates derived from the 1999 Constitution and Electoral Act 2022. Sync directly to your iPhone, Android, or desktop calendar."
        />

        {/* Countdown Hero Banner */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-neutral-900/60 to-black p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Clock className="h-3.5 w-3.5" /> Next Major Milestone
              </div>
              <h2 className="mt-3 text-xl sm:text-2xl font-bold text-white">
                Presidential & National Assembly Election Day
              </h2>
              <p className="mt-1 text-sm text-neutral-400 max-w-xl">
                Saturday, January 16, 2027 &bull; Polling opens 8:30 AM to 2:30 PM WAT across all polling units nationwide.
              </p>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2 sm:px-4 sm:py-3 min-w-[65px] sm:min-w-[76px]">
                <span className="text-xl sm:text-3xl font-extrabold text-white font-mono">{countdown.days}</span>
                <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">Days</span>
              </div>
              <span className="text-xl font-bold text-neutral-600">:</span>
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2 sm:px-4 sm:py-3 min-w-[55px] sm:min-w-[65px]">
                <span className="text-xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{String(countdown.hours).padStart(2, "0")}</span>
                <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">Hours</span>
              </div>
              <span className="text-xl font-bold text-neutral-600">:</span>
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2 sm:px-4 sm:py-3 min-w-[55px] sm:min-w-[65px]">
                <span className="text-xl sm:text-3xl font-extrabold text-white font-mono">{String(countdown.mins).padStart(2, "0")}</span>
                <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">Mins</span>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
            <a
              href={getWebcalUrl()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
            >
              <Smartphone className="h-4 w-4" /> Add to iPhone / Apple Calendar
            </a>

            <a
              href={getIcsDownloadUrl()}
              download="nigeria-2027-elections.ics"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <Download className="h-4 w-4" /> Download .ics
            </a>

            <button
              onClick={() => {
                setEmailState({ status: "idle", message: "" });
                setEmailModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <Mail className="h-4 w-4" /> Email Me Calendar
            </button>

            <button
              onClick={handleShareCalendar}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 px-3 py-2.5 text-xs text-neutral-400 hover:text-white transition-all ml-auto"
            >
              <Share2 className="h-3.5 w-3.5" /> {copiedLink ? "Link Copied!" : "Share"}
            </button>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {CALENDAR_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all",
                activeCategory === cat.key
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-white/5 hover:border-white/10"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Milestones Timeline */}
        <div className="mt-8 space-y-4">
          {filteredEvents.map((event, idx) => (
            <div
              key={event.id}
              className={cn(
                "group relative rounded-xl border p-5 sm:p-6 transition-all",
                event.isMajor
                  ? "border-emerald-500/30 bg-neutral-900/80 shadow-md shadow-emerald-950/20"
                  : "border-white/10 bg-neutral-900/40 hover:border-white/20"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {event.date}
                    </span>
                    <span className="text-xs text-neutral-500">&bull;</span>
                    <Badge tone={event.isMajor ? "verified" : "neutral"}>
                      {event.categoryLabel}
                    </Badge>
                    {event.timeStart && (
                      <span className="text-xs text-neutral-400 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {event.timeStart.slice(0, 5)} - {event.timeEnd.slice(0, 5)} WAT
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-sm text-neutral-300 leading-relaxed max-w-3xl">
                    {event.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-neutral-500" /> {event.location}
                    </span>
                    {event.legalBasis && (
                      <span className="inline-flex items-center gap-1 text-neutral-400">
                        <Scale className="h-3 w-3 text-emerald-500/70" /> {event.legalBasis}
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual 1-Click Calendar Add */}
                <div className="sm:self-center flex sm:flex-col items-center gap-2">
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-all"
                  >
                    Google Cal <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={getWebcalUrl()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-all"
                  >
                    Apple Cal
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="mt-12 rounded-xl border border-white/10 bg-neutral-900/30 p-6 text-xs text-neutral-400 space-y-2">
          <div className="font-semibold text-white text-sm">About CivicSense 2027 Election Data</div>
          <p>
            All calendar dates are based on the primary constitutional provisions governing Nigerian general elections and the Electoral Act 2022. As the Independent National Electoral Commission (INEC) issues supplementary notices or gazettes specific operational guidelines, this calendar is updated and automatically synced to all subscribed devices.
          </p>
        </div>
      </Container>

      {/* Email Delivery Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setEmailModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Get 2027 Calendar by Email</h3>
                <p className="text-xs text-neutral-400">Includes .ics file & native iPhone calendar links</p>
              </div>
            </div>

            {emailState.status === "success" ? (
              <div className="space-y-4 py-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{emailState.message}</span>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={getIcsDownloadUrl()}
                    download="nigeria-2027-elections.ics"
                    className="w-full text-center rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-semibold text-white transition-all"
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
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Enter your email to receive the complete 2027 Nigeria Election Calendar. Open the email on your iPhone or computer to add all 10 dates with 1 tap.
                </p>

                <div>
                  <label htmlFor="calendar-email-input" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    id="calendar-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. voter@gmail.com"
                    required
                    className="w-full rounded-xl border border-white/15 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {emailState.status === "error" && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{emailState.message}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={emailState.status === "loading"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5"
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
