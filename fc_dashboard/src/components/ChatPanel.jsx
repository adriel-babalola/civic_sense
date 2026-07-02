import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { API_BASE } from "../config";
import { parseVerdict } from "../utils/parseVerdict";

const CONFIG = {
  VERIFIED: { color: "text-verified", bg: "bg-verified/10" },
  FALSE: { color: "text-false", bg: "bg-false/10" },
  MISLEADING: { color: "text-misleading", bg: "bg-misleading/10" },
  UNVERIFIED: { color: "text-unverified", bg: "bg-unverified/10" },
};

export default function ChatPanel({ onNewCheck }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const claim = input.trim();
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
      onNewCheck?.();
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <Sparkles size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-white/80">Ask Kratos</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">
              Type any Nigerian political claim below.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Example: "Did Tinubu remove the fuel subsidy?"
            </p>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex items-start gap-3 justify-end">
              <div className="bg-accent/10 border border-accent/20 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-white/90">{m.text}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-accent" />
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-gray-400" />
              </div>
              <div className="bg-card border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] space-y-2">
                <VerdictContent text={m.text} />
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-gray-400" />
            </div>
            <div className="bg-card border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2 bg-card border border-white/10 rounded-xl px-4 py-2 focus-within:border-accent/50 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a claim to fact-check..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none py-1.5"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg text-gray-500 hover:text-accent hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
          {parsed.verdict}
        </span>
        {parsed.confidence > 0 && (
          <span className="text-xs text-gray-500">{parsed.confidence}%</span>
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
              className="text-xs text-accent hover:text-accent-hover underline underline-offset-2 truncate max-w-[220px]"
            >
              {url}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
