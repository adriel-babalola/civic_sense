import { Link } from "react-router-dom";
import { MessageSquare, Map, Users, ArrowRight, ShieldCheck, CheckCircle, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans antialiased overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-300">

      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative z-10 border-b border-neutral-900/80">
        <div className="max-w-5xl mx-auto px-6 py-28 md:py-36 text-center">

         

          {/* Main Typography Header */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
            Send a rumour to WhatsApp.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Get the truth back.
            </span>
          </h1>

          <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            No dedicated applications. No tedious forms. Just forward a political claim to our verification line and receive an AI-validated verdict in real-time.
          </p>

          {/* Primary Action Row Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-emerald-950/50"
            >
              <MessageSquare size={16} />
              Try It Now on WhatsApp
            </a>
            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 text-neutral-300 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200"
            >
              <Map size={16} />
              View Incident Map
            </Link>
          </div>
        </div>
      </section>

      {/* THREE TOOLS / BENTO GRID FEATURE SECTION */}
      <section className="relative z-10 border-b border-neutral-900/80 bg-[#070707]/30">
        <div className="max-w-6xl mx-auto px-6 py-24">

          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Three tools. One WhatsApp number.
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Everything required to check volatile claims, trace local conflict updates, and document civic infractions safely.
            </p>
          </div>

          {/* ASYMMETRIC GRID SYSTEM (BENTO STYLE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* FEATURE 1: DENSE EXPANDED CARD (Spans 2 columns on desktop) */}
            <div className="md:col-span-2 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm">
              <div className="max-w-md space-y-4 relative z-10">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <MessageSquare size={18} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Instant Fact-Checking</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Send suspicious political claims directly to our verification agent. Access a comprehensive regional database powered by contextual AI to receive factual cross-references within 30 seconds.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1.5 font-mono text-emerald-500"><CheckCircle size={12} /> AI-Engine Grounded</span>
                <span className="font-mono">Response time ~24s</span>
              </div>
            </div>

            {/* FEATURE 2: SLIM STANDALONE WIDGET */}
            <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-8 flex flex-col justify-between group backdrop-blur-sm">
              <div className="space-y-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Map size={18} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Live Incident Map</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Monitor live structural feeds documenting electoral disputes, localized disruption patterns, and verified security metrics down to a local government authority level.
                </p>
              </div>
              <div className="mt-6">
                <Link to="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                  Explore Map View <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* FEATURE 3: COMPACT FULL-WIDTH SECTION */}
            <div className="md:col-span-3 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
              <div className="flex gap-5 items-start max-w-2xl">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mt-1">
                  <Users size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Collective Protective Voice</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Submit secure, highly encrypted alerts containing instances of structural malpractice or civil endangerment. Your personal identity metadata remains stripped and completely protected.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Link to="/report" className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-300 rounded-lg transition-colors">
                  File Report
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section className="relative z-10 py-40 bg-[#050505] border-b border-neutral-900/80">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-800/50 shadow-xl">
            <iframe
              src="https://www.youtube.com/embed/nhasRYxrBNc"
              title="CivicSense Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              See CivicSense in Action
            </h2>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
              Watch how the WhatsApp fact-check bot, live incident map, and anonymous reporting system work together to fight misinformation across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
              <span className="text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium">~20s response</span>
              <span className="text-xs px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 font-medium">No sign-up</span>
              <span className="text-xs px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 font-medium">WhatsApp only</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL-TO-ACTION (CTA) BLOCK */}
      <section className="relative z-10 py-24 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Built for every Nigerian
            </h2>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
              Accessible across major urban networks or remote areas with low bandwidth. No stable data connection available? Drop an alternate inquiry line via standard network SMS channels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
            <Link
              to="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-semibold text-sm rounded-xl transition-colors"
            >
              <ShieldCheck size={16} />
              Report an Incident
            </Link>
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-colors"
            >
              <Smartphone size={16} />
              Fact-Check on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
