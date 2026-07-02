export function parseVerdict(text) {
  if (!text) {
    return { verdict: "UNVERIFIED", confidence: 0, evidence: "", source: "" };
  }

  const v = text.match(/\*VERDICT:\s*(\w+)/)?.[1] || "UNVERIFIED";
  const c = text.match(/\*Confidence:\s*(\d+)/)?.[1] || "0";
  const evidence = text
    .match(/\*What we found:\*?\n?([\s\S]*?)(?:\*Source|$)/)?.[1]
    ?.trim();
  const source = text.match(/\*Source:\*?\n?([\s\S]+)/)?.[1]?.trim();

  const confidence = Math.min(100, Math.max(0, parseInt(c)));

  return {
    verdict: v,
    confidence,
    evidence: evidence || "No evidence provided.",
    source: source || "",
  };
}
