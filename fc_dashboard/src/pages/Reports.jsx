export default function Reports() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Anonymous Reporting</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Coming soon — submit misconduct reports with evidence. Your identity stays protected.
          </p>
        </div>
      </div>
      <footer className="border-t border-[#1E1E1E] px-6 py-3 shrink-0">
        <p className="text-xs text-[#6B7280] text-center">Built for BuildVerse 2026</p>
      </footer>
    </div>
  );
}
