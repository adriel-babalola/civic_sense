import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900/80 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">CS</span>
              </div>
              <h3 className="text-base font-bold text-white">CivicSense</h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Send a rumour to WhatsApp. Get the truth back.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><a href="/" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">Home</a></li>
              <li><a href="/report" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">Report an Incident</a></li>
              <li><a href="/map" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">Incident Map</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200"
            >
              <MessageSquare size={14} />
              Try on WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-neutral-900/80 -mb-6 mt-10 pt-6 text-center">
          <p className="text-xs text-neutral-500">&copy; {new Date().getFullYear()} CivicSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
