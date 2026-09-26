export function parseVerdict(text) {
  const verdict =
    text.match(/\*VERDICT:\s*(\w+)/)?.[1] || "UNVERIFIED";
  const evidence = text
    .match(/\*What we found:\*?\n?([\s\S]*?)(?:\*Source|$)/)?.[1]
    ?.trim();
  const source = text.match(/\*Source:\*?\n?([\s\S]+)/)?.[1]?.trim();

  return {
    verdict,
    evidence: evidence || "",
    source: source || "",
  };
}
