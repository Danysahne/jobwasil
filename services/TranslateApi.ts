import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/services/ApiClient';

export type TranslateDirection = 'de-ar' | 'ar-de';

// Translations are expensive (paid API call) and never change, so they are
// cached on the device. Memory holds the whole map; writes are debounced.
const STORAGE_KEY = 'jobwasil.translations';
const MAX_ENTRIES = 2000;

let memory: Record<string, string> = {};
let hydrated = false;
let hydrating: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function hydrate(): Promise<void> {
  if (hydrated) return Promise.resolve();
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') memory = parsed;
        }
      })
      .catch(() => {
        // Unreadable cache — start empty rather than failing the translation
      })
      .finally(() => {
        hydrated = true;
      });
  }
  return hydrating;
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const keys = Object.keys(memory);
    if (keys.length > MAX_ENTRIES) {
      // Keys keep insertion order, so the tail is the most recently added.
      const trimmed: Record<string, string> = {};
      for (const k of keys.slice(keys.length - MAX_ENTRIES)) trimmed[k] = memory[k];
      memory = trimmed;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory)).catch(() => {});
  }, 1000);
}

/** Returns translated fields, or null when the request failed. */
async function requestTranslation(
  fields: Record<string, string>,
  direction: TranslateDirection,
): Promise<Record<string, string> | null> {
  try {
    const response = await apiFetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, direction }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.fields ?? null;
  } catch {
    return null;
  }
}

/**
 * Translates a set of labelled fields belonging to one entity.
 * Field names must be regex-safe — they are used as section labels.
 */
export async function translateFields(
  fields: Record<string, string>,
  cacheKey: string,
  direction: TranslateDirection = 'de-ar',
): Promise<Record<string, string>> {
  await hydrate();
  const prefix = `${direction}:${cacheKey}:`;

  const result: Record<string, string> = {};
  const missing: Record<string, string> = {};
  for (const [key, text] of Object.entries(fields)) {
    const hit = memory[prefix + key];
    if (hit !== undefined) result[key] = hit;
    else missing[key] = text;
  }
  if (Object.keys(missing).length === 0) return result;

  const fresh = await requestTranslation(missing, direction);
  for (const [key, original] of Object.entries(missing)) {
    const translated = fresh?.[key];
    if (typeof translated === 'string' && translated.trim()) {
      result[key] = translated;
      memory[prefix + key] = translated;
    } else {
      result[key] = original; // fall back to the original text
    }
  }
  if (fresh) scheduleSave();
  return result;
}

/**
 * Translates many independent items keyed by a stable id (e.g. a job id),
 * caching each one separately so a job is only ever paid for once — even
 * when it shows up in a different search later.
 */
export async function translateEach(
  items: Record<string, string>,
  direction: TranslateDirection = 'de-ar',
): Promise<Record<string, string>> {
  await hydrate();
  const prefix = `${direction}:item:`;

  const result: Record<string, string> = {};
  const missingIds: string[] = [];
  for (const [id, text] of Object.entries(items)) {
    const hit = memory[prefix + id];
    if (hit !== undefined) result[id] = hit;
    else if (text.trim()) missingIds.push(id);
  }
  if (missingIds.length === 0) return result;

  // Ids may contain regex-special characters, so send synthetic labels.
  const payload: Record<string, string> = {};
  missingIds.forEach((id, i) => {
    payload[`k${i}`] = items[id];
  });

  const fresh = await requestTranslation(payload, direction);
  missingIds.forEach((id, i) => {
    const translated = fresh?.[`k${i}`];
    if (typeof translated === 'string' && translated.trim()) {
      result[id] = translated;
      memory[prefix + id] = translated;
    } else {
      result[id] = items[id];
    }
  });
  if (fresh) scheduleSave();
  return result;
}
