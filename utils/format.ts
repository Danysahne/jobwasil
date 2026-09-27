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

// The API returns regions as SCREAMING_SNAKE_CASE ("NORDRHEIN_WESTFALEN").
const BUNDESLAENDER: Record<string, string> = {
  BADEN_WUERTTEMBERG: 'Baden-Württemberg',
  BAYERN: 'Bayern',
  BERLIN: 'Berlin',
  BRANDENBURG: 'Brandenburg',
  BREMEN: 'Bremen',
  HAMBURG: 'Hamburg',
  HESSEN: 'Hessen',
  MECKLENBURG_VORPOMMERN: 'Mecklenburg-Vorpommern',
  NIEDERSACHSEN: 'Niedersachsen',
  NORDRHEIN_WESTFALEN: 'Nordrhein-Westfalen',
  RHEINLAND_PFALZ: 'Rheinland-Pfalz',
  SAARLAND: 'Saarland',
  SACHSEN: 'Sachsen',
  SACHSEN_ANHALT: 'Sachsen-Anhalt',
  SCHLESWIG_HOLSTEIN: 'Schleswig-Holstein',
  THUERINGEN: 'Thüringen',
};

export function prettyRegion(region?: string): string {
  if (!region) return '';
  const known = BUNDESLAENDER[region.toUpperCase()];
  if (known) return known;
  // Unknown value (e.g. abroad) — title-case it rather than shouting.
  return region
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

/** "Rheine, Nordrhein-Westfalen" — without repeating city-states. */
export function formatCityRegion(ort?: string, region?: string): string {
  const city = ort?.trim();
  const state = prettyRegion(region);
  if (city && state && city.toLowerCase() !== state.toLowerCase()) {
    return `${city}, ${state}`;
  }
  return city || state;
}
