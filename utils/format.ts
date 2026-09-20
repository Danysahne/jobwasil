// Left-to-right isolate around neutral/numeric runs. Without it a date like
// "1.10.2026" is visually reordered when it sits inside Arabic text and comes
// out as "12026/10/".
const LRI = '⁦';
const PDI = '⁩';

export function isolateLtr(text: string): string {
  return `${LRI}${text}${PDI}`;
}

/**
 * Formats an ISO date for display, safe to place inside RTL text.
 * Dates stay in German notation in both languages: these are German job
 * listings, and it matches what the official listing shows on application.
 */
export function formatDate(value: string | number | undefined, isArabic: boolean): string {
  if (!value) return '';
  let formatted = String(value);
  try {
    formatted = new Date(value).toLocaleDateString('de-DE');
  } catch {
    // Keep the raw value if it is not a parsable date
  }
  return isArabic ? isolateLtr(formatted) : formatted;
}
