import { useState, useRef, useEffect } from "react";
import { API_BASE } from "../config";
import { Send, Loader2 } from "lucide-react";
import { parseVerdict } from "../utils/parseVerdict";

const BADGE_VARIANTS = {
  VERIFIED: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  FALSE: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  MISLEADING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  UNVERIFIED: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20",
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const claim = input.trim();
    if (!claim || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: claim }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      const json = await res.json();
      const verdictText = json.data?.verdict || "No response";
      const parsed = parseVerdict(verdictText);
      setMessages((prev) => [...prev, { role: "assistant", text: verdictText, parsed }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Could not reach the server. Try again.", parsed: null },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
        {empty && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-[#6B7280] mb-2">
                Type a Nigerian political claim below.
              </p>
              <p className="text-xs text-[#6B7280]">
                Get an instant fact-check verdict.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-[700px] mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-[#1E1E1E] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-white">{msg.text}</p>
                  </div>
                </div>
              )}

              {msg.role === "assistant" && msg.parsed && (
                <div className="bg-[#141414] rounded-xl border border-[#1E1E1E] overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                        BADGE_VARIANTS[msg.parsed.verdict] || BADGE_VARIANTS.UNVERIFIED
                      }`}
                    >
                      {msg.parsed.verdict}
                    </span>
                  </div>

                  {msg.parsed.evidence && (
                    <>
                      <div className="border-t border-[#1E1E1E]/50" />
                      <div className="px-5 py-3">
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                          {msg.parsed.evidence}
                        </p>
                      </div>
                    </>
                  )}

                  {(() => {
                    const urls = msg.parsed.source?.match(/https?:\/\/[^\s]+/gi);
                    const hasPills = urls && urls.length > 0;
                    if (hasPills) {
                      return (
                        <>
                          <div className="border-t border-[#1E1E1E]/50" />
                          <div className="px-5 py-3 flex flex-wrap gap-1.5">
                            {urls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-[#0A0A0A] text-[#6B7280] px-2.5 py-1 rounded-md border border-[#1E1E1E] hover:text-[#A1A1AA] hover:border-[#333] transition-all"
                              >
                                {new URL(url).hostname.replace("www.", "")}
                              </a>
                            ))}
                          </div>
                        </>
                      );
                    }
                    if (msg.parsed.source) {
                      return (
                        <>
                          <div className="border-t border-[#1E1E1E]/50" />
                          <div className="px-5 py-3">
                            <span className="text-xs text-[#6B7280]">{msg.parsed.source}</span>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {msg.role === "assistant" && !msg.parsed && (
                <div className="bg-[#141414] rounded-xl p-5 border border-[#1E1E1E]">
                  <p className="text-sm text-[#EF4444]">{msg.text}</p>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-[#141414] rounded-xl p-5 border border-[#1E1E1E] flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-[#22C55E]" />
              <p className="text-sm text-[#6B7280]">Checking the facts...</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] px-8 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-[700px] mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a claim to fact-check..."
            className="flex-1 bg-[#141414] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] border border-[#1E1E1E] outline-none focus:border-[#22C55E]/40 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#22C55E]/10 text-[#22C55E] rounded-xl px-4 py-2.5 border border-[#22C55E]/20 hover:bg-[#22C55E]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
