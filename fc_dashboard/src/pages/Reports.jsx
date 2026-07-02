import { Flag } from "lucide-react";

export default function Reports() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-false/10 border border-false/20 flex items-center justify-center mx-auto mb-5">
          <Flag size={28} className="text-false" />
        </div>
        <h2 className="text-xl font-semibold text-white/90 mb-2">
          Anonymous Reporting
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Coming soon — submit misconduct reports with evidence.
          Your identity stays protected while holding power accountable.
        </p>
      </div>
    </div>
  );
}
