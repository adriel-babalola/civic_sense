import { useState } from "react";
import { submitReport } from "../api/client";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const TYPES = [
  { value: "violence", label: "Violence / Security Incident" },
  { value: "misconduct", label: "Electoral Misconduct" },
  { value: "unrest", label: "Civil Unrest / Protest" },
];

export default function Report() {
  const [form, setForm] = useState({ type: "", description: "", state: "", lga: "", evidence: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus(null);
    if (!form.type || !form.description || !form.state || !form.lga) {
      setError("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      const res = await submitReport(form);
      if (res.success) {
        setStatus("success");
        setForm({ type: "", description: "", state: "", lga: "", evidence: "" });
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch {
      setError("Failed to submit. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Report an Incident</h1>
        <p className="text-sm text-neutral-400">
          Your identity stays protected. No personal information is collected.
        </p>
      </div>

      {status === "success" && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5 mb-8 flex items-start gap-3 backdrop-blur-sm">
          <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-400 mb-1">Report submitted</p>
            <p className="text-xs text-neutral-400">
              Your report has been recorded. It will be reviewed and may appear on the public incident map after verification.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-5 mb-8 flex items-start gap-3 backdrop-blur-sm">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Type of Incident *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("type", t.value)}
                className={`rounded-xl px-4 py-3 text-sm border text-left transition-all duration-200 ${
                  form.type === t.value
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            placeholder="What happened? Include as much detail as possible..."
            className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/40 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">State *</label>
            <select
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 transition-colors appearance-none"
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">LGA *</label>
            <input
              type="text"
              value={form.lga}
              onChange={(e) => update("lga", e.target.value)}
              placeholder="Local Government Area"
              className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Photo / Video URL <span className="text-neutral-500 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={form.evidence}
            onChange={(e) => update("evidence", e.target.value)}
            placeholder="https://"
            className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        <div className="border-t border-neutral-900/80 pt-6">
          <button
            type="submit"
            disabled={sending}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : null}
            {sending ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
