import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, MessageCircle } from "lucide-react";
import { API_BASE, WHATSAPP_NUMBER } from "../config";
import { parseVerdict } from "../utils/parseVerdict";

const CONFIG = {
  VERIFIED: { color: "text-verified", bg: "bg-verified/10", border: "border-verified/20" },
  FALSE: { color: "text-false", bg: "bg-false/10", border: "border-false/20" },
  MISLEADING: { color: "text-misleading", bg: "bg-misleading/10", border: "border-misleading/20" },
  UNVERIFIED: { color: "text-unverified", bg: "bg-unverified/10", border: "border-unverified/20" },
};

const SUGGESTIONS = [
  "Did Tinubu remove the fuel subsidy?",
  "Did Nigeria ban crypto completely?",
  "Is Borno state free of Boko Haram?",
  "Did Nigeria increase minimum wage?",
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e, claimText) {
    if (e?.preventDefault) e.preventDefault();
    const claim = (claimText || input).trim();
    if (!claim || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: claim }]);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      const json = await res.json();
      const verdictText = json.data?.verdict || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", text: verdictText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "*VERDICT: UNVERIFIED*\n*Confidence: 0%*\n*What we found:*\nCould not reach the fact-check service. Check your connection and try again.\n*Source:* System",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2.5 p-5 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white/80">Ask Kratos</h2>
          <p className="text-[11px] text-gray-600">AI fact-checking engine</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-accent/60" />
            </div>
            <p className="text-base text-gray-400 font-light">
              Type a Nigerian political claim to fact-check
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Or send a message to{" "}
              <span className="text-accent">{WHATSAPP_NUMBER}</span> on WhatsApp
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(null, s)}
                  className="px-3.5 py-2 rounded-xl glass-card text-xs text-gray-400 hover:text-gray-200 hover:border-white/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex items-start gap-3 justify-end">
              <div className="glass-card rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white/90">{m.text}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                <User size={15} className="text-accent" />
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-card border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={15} className="text-gray-500" />
              </div>
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3.5 max-w-[80%] space-y-2.5">
                <VerdictContent text={m.text} />
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-card border border-white/[0.06] flex items-center justify-center shrink-0">
              <Bot size={15} className="text-gray-500" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 md:p-6 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-2.5 focus-within:border-accent/30 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a claim to fact-check..."
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-gray-700 outline-none py-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2 rounded-xl text-gray-600 hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function VerdictContent({ text }) {
  const parsed = parseVerdict(text);
  const cfg = CONFIG[parsed.verdict] || CONFIG.UNVERIFIED;
  const sourceUrl = parsed.source?.match(/https?:\/\/[^\s]+/gi);

  return (
    <>
      <div className="flex items-center gap-2.5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
        >
          {parsed.verdict}
        </span>
        {parsed.confidence > 0 && (
          <span className="text-[11px] text-gray-600">{parsed.confidence}% confidence</span>
        )}
      </div>
      {parsed.evidence && (
        <p className="text-sm text-gray-300 leading-relaxed">{parsed.evidence}</p>
      )}
      {sourceUrl && sourceUrl.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sourceUrl.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent/80 hover:text-accent underline underline-offset-2 truncate max-w-[260px] transition-colors"
            >
              {url}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
