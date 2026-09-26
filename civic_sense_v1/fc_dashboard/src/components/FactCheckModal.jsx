import { useState } from "react";
import { API_BASE } from "../config";
import { X, Loader2, Send } from "lucide-react";

const BADGE = {
  VERIFIED: "bg-[#10B981]/10 text-[#10B981]",
  FALSE: "bg-[#EF4444]/10 text-[#EF4444]",
  MISLEADING: "bg-[#F59E0B]/10 text-[#F59E0B]",
  UNVERIFIED: "bg-[#6B7280]/10 text-[#6B7280]",
};

function parseVerdict(text) {
  const v = text.match(/\*VERDICT:\s*(\w+)/)?.[1] || "UNVERIFIED";
  const evidence = text.match(/\*What we found:\*?\n?([\s\S]*?)(?:\*Source|$)/)?.[1]?.trim();
  const source = text.match(/\*Source:\*?\n?([\s\S]+)/)?.[1]?.trim();
  return { verdict: v, evidence: evidence || "", source: source || "" };
}

export default function FactCheckModal({ open, onClose }) {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheck() {
    const text = claim.trim();
    if (!text) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: text }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Request failed");
      setResult(parseVerdict(json.data.verdict));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#141414] rounded-xl border border-[#1E1E1E] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <h2 className="text-sm font-semibold text-white">Fact-Check a Claim</h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Type or paste a Nigerian political claim..."
            rows={3}
            className="w-full bg-[#0A0A0A] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] border border-[#1E1E1E] outline-none focus:border-[#22C55E]/40 transition-colors resize-none"
          />

          <button
            onClick={handleCheck}
            disabled={loading || !claim.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#22C55E]/10 text-[#22C55E] rounded-xl px-4 py-2.5 border border-[#22C55E]/20 hover:bg-[#22C55E]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Send size={16} />
                Check Claim
              </>
            )}
          </button>

          {error && (
            <div className="bg-[#EF4444]/10 rounded-xl p-4 border border-[#EF4444]/20">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-[#0A0A0A] rounded-xl p-5 border border-[#1E1E1E]">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${BADGE[result.verdict] || BADGE.UNVERIFIED}`}>
                  {result.verdict}
                </span>
              </div>
              {result.evidence && (
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-2">
                  {result.evidence}
                </p>
              )}
              {result.source && (
                <p className="text-xs text-[#6B7280]">Source: {result.source}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
