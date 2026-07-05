import { apiFetch } from '@/services/ApiClient';

// Simple in-memory cache: cacheKey → translated fields
const cache = new Map<string, Record<string, string>>();

export async function translateFields(
  fields: Record<string, string>,
  cacheKey: string,
): Promise<Record<string, string>> {
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const response = await apiFetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    const data = await response.json();
    const result: Record<string, string> = data.fields ?? fields;
    cache.set(cacheKey, result);
    return result;
  } catch {
    // Network or parse error — return originals so the app keeps working
    return fields;
  }
}
