export interface Arbeitsort {
  plz?: string;
  ort?: string;
  strasse?: string | null;
  region?: string | null;
  land?: string | null;
  koordinaten?: { lat?: number; lon?: number } | null;
}

export interface Job {
  titel?: string;
  title?: string;
  berufsbezeichnung?: string;
  arbeitsort?: Arbeitsort;
  ort?: string;
  location?: string;
  [key: string]: any;
}
