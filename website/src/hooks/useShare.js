import { useCallback, useState } from "react";

/**
 * Share a URL through the native share sheet, falling back to the clipboard.
 *
 * `navigator.share` only exists in a secure context and only on mobile, so
 * every branch has to be treated as the exception rather than the rule.
 */
export function useShare({ title, text, url } = {}) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const data = { title, text, url };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return "shared";
      } catch (err) {
        // A user dismissing the sheet is not an error worth surfacing.
        if (err?.name === "AbortError") return "cancelled";
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      return "copied";
    } catch {
      return "failed";
    }
  }, [title, text, url]);

  return { share, copied };
}

export default useShare;
