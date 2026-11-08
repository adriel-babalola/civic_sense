import { useState } from "react";
import { Container } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Field } from "../../components/shared/Field";
import CONFIG from "../../config/config";

export function Feedback() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!message.trim()) return setError("Please enter your feedback.");
    setStatus("loading");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: email.trim() || undefined, page: window.location.pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Could not send feedback");
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      setError(err.message);
    }
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-fg">Feedback</h1>
        <p className="mt-2 text-sm text-fg-secondary">Share feedback to help improve CivicSense. Email is optional.</p>
        {status === "sent" ? (
          <div className="cs-card mt-6 p-4 text-sm text-fg-secondary">Thank you. Your feedback was sent.</div>
        ) : (
          <form onSubmit={onSubmit} className="cs-card mt-6 space-y-4 p-5">
            <Field label="Feedback" required>
              <textarea className="cs-input min-h-[140px] w-full" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Tell us what worked, what didn't, or what to improve." />
            </Field>
            <Field label="Email (optional)">
              <input className="cs-input w-full" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <Button type="submit" disabled={status==="loading"}>{status==="loading" ? "Sending..." : "Send feedback"}</Button>
          </form>
        )}
      </div>
    </Container>
  );
}

export default Feedback;
