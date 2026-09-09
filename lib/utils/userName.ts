/**
 * Resolves a real, clean user display name.
 * Priority:
 * 1. Real Firebase display name (if not generic "User")
 * 2. Formatted prefix of email (e.g. "vineet.kumar@gmail.com" -> "Vineet Kumar", "vineet@..." -> "Vineet")
 * 3. Default fallback: "Vineet" (never generic "User")
 */
export function resolveUserName(displayName?: string | null, email?: string | null): string {
  if (displayName && displayName.trim() && displayName.trim().toLowerCase() !== 'user') {
    return displayName.trim();
  }
  if (!email) return 'Vineet';
  const prefix = email.split('@')[0];
  const formatted = prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return formatted || 'Vineet';
}
