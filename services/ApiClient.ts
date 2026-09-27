import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const STORAGE_KEY = 'jobwasil.accessCode';

let accessCode: string | null = null;

export async function loadAccessCode(): Promise<string> {
  if (accessCode === null) {
    accessCode = (await AsyncStorage.getItem(STORAGE_KEY)) ?? '';
  }
  return accessCode;
}

export async function saveAccessCode(code: string): Promise<void> {
  accessCode = code;
  await AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
}

/** Fetch against the proxy with the access code header attached. */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const code = await loadAccessCode();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (code) headers['X-Access-Code'] = code;
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

/**
 * Check whether the given (or stored) code is accepted by the proxy.
 * Network errors fail open so the app stays usable offline (favorites);
 * only an explicit 401 counts as rejected.
 */
export async function verifyAccess(code?: string): Promise<boolean> {
  const useCode = code ?? (await loadAccessCode());
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: useCode ? { 'X-Access-Code': useCode } : {},
    });
    return res.status !== 401;
  } catch {
    return true;
  }
}
