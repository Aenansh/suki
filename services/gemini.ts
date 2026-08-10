import { getCachedSugar } from '@/db/queries/frequentPicks';
import { getApiKey } from './apiKey';

// Model: gemini-3.6-flash — current GA flash model as of 2026-08 (fast, generous free tier,
// accurate for factual lookups). Google has no auto-updating "latest" alias for this endpoint,
// so this WILL need bumping again when Google deprecates it — that's exactly what happened to
// the previous pin (gemini-2.5-flash → HTTP 404 "no longer available to new users", 2026-08-10).
// If estimates silently stop working again, check this constant against
// https://ai.google.dev/gemini-api/docs/latest-model before anything else.
// Temperature: 0.1 (factual query — keep responses consistent and parseable)
const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SUGAR_PROMPT = (foodName: string, quantity: string) =>
  `
You are a nutritional reference assistant.
Given a food item and quantity, return ONLY valid JSON:
{
  "sugar_g": <number, one decimal>,
  "confidence": <"high"|"medium"|"low">,
  "note": <string, max 8 words>
}
Food: ${foodName}
Quantity: ${quantity}
Return ONLY the JSON. No explanation, no markdown.
`.trim();

export type SugarEstimate = {
  sugarG: number;
  confidence: 'high' | 'medium' | 'low';
  note: string;
};

/** Shared call — returns the raw model text, or null on any failure (no key, offline, non-2xx).
 * Failures log a dev-only diagnostic (status + a body snippet — never the key itself) so a
 * silent fallback to manual entry is debuggable instead of just "the LLM isn't working". */
async function callGemini(prompt: string, temperature: number): Promise<string | null> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    if (__DEV__) console.warn('[gemini] no API key set — falling back');
    return null;
  }

  try {
    const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    });
    if (!response.ok) {
      if (__DEV__) {
        const body = await response.text().catch(() => '');
        console.warn(`[gemini] request failed: HTTP ${response.status} ${response.statusText} — ${body.slice(0, 300)}`);
      }
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' && __DEV__) {
      console.warn('[gemini] unexpected response shape:', JSON.stringify(data).slice(0, 300));
    }
    return typeof text === 'string' ? text : null;
  } catch (err) {
    // Network failure, timeout, etc. — never surface this as an error, just fall back.
    if (__DEV__) console.warn('[gemini] request threw:', err instanceof Error ? err.message : err);
    return null;
  }
}

function parseEstimate(text: string): SugarEstimate | null {
  try {
    // Models sometimes wrap JSON in a ```json fence despite the prompt — strip it defensively.
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const sugarG = Number(parsed.sugar_g);
    if (!Number.isFinite(sugarG) || sugarG < 0) return null;
    return {
      sugarG,
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
      note: typeof parsed.note === 'string' ? parsed.note.slice(0, 60) : '',
    };
  } catch {
    return null;
  }
}

/**
 * Estimates sugar grams for a food + quantity via Gemini. Returns null on any failure — no
 * key, offline, bad response — so the caller always falls back to the manual grams input
 * (never a hard error; smart logging degrades gracefully, per CLAUDE.md's offline-first rule).
 *
 * Cache: if a matching frequent_pick already has a `last_sugar_g`, that's used instead of
 * calling the API — cheap and consistent with what the user logged last time.
 */
export async function estimateSugar(foodName: string, quantity: string): Promise<SugarEstimate | null> {
  const trimmedFood = foodName.trim();
  if (!trimmedFood) return null;

  const cached = await getCachedSugar(trimmedFood.toLowerCase());
  if (cached != null) {
    if (__DEV__) console.warn(`[gemini] "${trimmedFood}" served from frequent_pick cache (${cached}g) — no API call made`);
    return { sugarG: cached, confidence: 'high', note: 'From your last log' };
  }

  const text = await callGemini(SUGAR_PROMPT(trimmedFood, quantity || '1 serving'), 0.1);
  const result = text ? parseEstimate(text) : null;
  if (__DEV__) console.warn(result ? `[gemini] estimate for "${trimmedFood}": ${result.sugarG}g` : `[gemini] no usable estimate for "${trimmedFood}"`);
  return result;
}

const SWAP_PROMPT = (craving: string) =>
  `
You are a warm, encouraging craving-support coach inside a sugar tracking app called Suki. Never
preachy or clinical — think supportive friend, not a diet app.
The user has a craving for: ${craving}
In one short sentence (under 18 words), suggest ONE specific, appealing low-sugar or sugar-free
swap they could reach for right now instead.
Return ONLY that sentence. No quotes, no markdown, no extra commentary.
`.trim();

/** Static, offline-safe suggestions — used when there's no key or the call fails, so the SOS
 * swap flow never leaves the user with nothing (offline-first, per CLAUDE.md's UX rules). */
const FALLBACK_SWAPS = [
  'Try a big glass of ice-cold sparkling water with a squeeze of lime.',
  'Freeze a banana for 20 minutes — it eats like soft-serve.',
  'A small handful of nuts or roasted chana can take the edge off fast.',
  'Brew a cup of masala chai or herbal tea and sip it slowly.',
  'Cold yoghurt with a pinch of cinnamon scratches a similar itch.',
];

/** Suggests one lower-sugar swap for a craving. Returns a static fallback (never null) when
 * there's no key or the call fails, so the SOS screen always has something to show. */
export async function suggestSwap(craving: string): Promise<string> {
  const text = await callGemini(SWAP_PROMPT(craving.trim() || 'something sweet'), 0.4);
  const cleaned = text?.replace(/["*_`]/g, '').trim().slice(0, 160);
  return cleaned || FALLBACK_SWAPS[Math.floor(Math.random() * FALLBACK_SWAPS.length)];
}
