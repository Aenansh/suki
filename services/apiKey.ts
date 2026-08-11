import * as SecureStore from 'expo-secure-store';

/** The ONLY place the Gemini key is touched. Never put it in Zustand state, never log it. */
const KEY = 'suki_gemini_key';

export const getApiKey = () => SecureStore.getItemAsync(KEY);
export const setApiKey = (v: string) => SecureStore.setItemAsync(KEY, v);
export const clearApiKey = () => SecureStore.deleteItemAsync(KEY);

export type ApiKeyValidation =
  | { valid: true; model?: string }
  | { valid: false; reason: string };

/** Settings screen display only — first 4 + last 4 chars, e.g. "AIza••••••••XYZ9". */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
  // Gemini keys are 39 chars, start with "AIza", and are alphanumeric + "-" + "_"
  const key = apiKey.trim();
  try {
    // Real Gemini REST API: generativelanguage.googleapis.com, key as a query param (not a
    // Bearer header — that's how Google's Generative Language API authenticates).
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      const model = data?.models?.[0]?.name || undefined;
      return { valid: true, model };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, reason: 'Invalid API key' };
    }

    return { valid: false, reason: `Unexpected response: ${response.status}` };
  } catch {
    return { valid: false, reason: 'Could not reach AI service' };
  }
}
