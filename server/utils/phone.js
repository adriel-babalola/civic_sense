// Universal phone number normalizer for consistent promptStates keys
// Accepts: +8801700000000, 8801700000000, 2347063373229, 01700000000
// Returns: +2347063373229 (E.164 format with + prefix)
export function normalizePhoneNumber(num) {
  if (!num) return num;
  let cleaned = num.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+") && cleaned.length > 8) {
    return "+" + cleaned;
  }
  return cleaned;
}
