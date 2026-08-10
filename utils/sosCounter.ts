import AsyncStorage from '@react-native-async-storage/async-storage';

/** How many times the user has tapped "I rode it out" on the SOS screen. A lightweight counter,
 * not core relational data, so it lives in AsyncStorage alongside onboarding/preference flags
 * (CLAUDE.md §3) rather than the locked SQLite schema. Used only to unlock the "Rode It Out" badge. */
const KEY = 'suki_sos_resist_count';

export async function getSosResistCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export async function incrementSosResistCount(): Promise<number> {
  const next = (await getSosResistCount()) + 1;
  await AsyncStorage.setItem(KEY, String(next));
  return next;
}
