import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { Button, Stepper, TextField } from '@/components/ui';
import { QUANTITY_CHIPS } from '@/constants/quantityChips';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { estimateSugar } from '@/services/gemini';
import { getApiKey } from '@/services/apiKey';
import { useFrequentPicksStore } from '@/stores/frequentPicksStore';
import { useLogStore } from '@/stores/logStore';
import { canEditEntry } from '@/utils/entryEditWindow';

type Step = 'pick' | 'qty' | 'busy' | 'confirm' | 'manual' | 'locked';

export default function Log() {
  const t = useAppTheme();
  const params = useLocalSearchParams<{ editId?: string }>();
  const picks = useFrequentPicksStore((s) => s.picks);
  const loadPicks = useFrequentPicksStore((s) => s.loadPicks);
  const recordLog = useFrequentPicksStore((s) => s.recordLog);
  const addEntry = useLogStore((s) => s.addEntry);
  const editEntryInStore = useLogStore((s) => s.editEntry);
  const deleteEntry = useLogStore((s) => s.deleteEntry);

  // Edit mode: opened from tapping a today's-log row (components/home/EntryRow.tsx). Resolved
  // once at mount — today's entries don't move out from under an open edit sheet.
  const [editingEntry] = useState(() =>
    params.editId ? (useLogStore.getState().todayEntries.find((e) => e.id === params.editId) ?? null) : null
  );
  const isEditRoute = !!params.editId;
  const editLockReason: 'redeemed' | 'expired' | 'missing' | null = !isEditRoute
    ? null
    : !editingEntry
      ? 'missing'
      : editingEntry.source === 'redeemed'
        ? 'redeemed' // already spent — rewriting it after the fact would let SP be gamed
        : !canEditEntry(editingEntry)
          ? 'expired'
          : null;

  // Editing always re-asks the quantity and re-runs the same Gemini estimate a fresh log would
  // get — never a bare manual-grams box, so a correction is exactly as informed as the original.
  const [step, setStep] = useState<Step>(() => (isEditRoute ? (editLockReason ? 'locked' : 'qty') : 'pick'));
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [foodName, setFoodName] = useState(editingEntry?.foodName ?? '');
  const [quantity, setQuantity] = useState(editingEntry?.quantityDescription ?? '');
  const [grams, setGrams] = useState(editingEntry?.sugarG ?? 10);
  const [note, setNote] = useState('');
  const [manualReason, setManualReason] = useState('');

  useEffect(() => {
    loadPicks();
    getApiKey().then((k) => setHasKey(!!k));
  }, [loadPicks]);

  const query = foodName.toLowerCase().trim();
  const suggestions = query.length < 2 ? [] : picks.filter((p) => p.foodName.toLowerCase().includes(query)).slice(0, 4);

  function pickFood(name: string, lastQuantity?: string | null) {
    setFoodName(name);
    setQuantity(lastQuantity ?? '');
    setStep('qty');
  }

  async function runEstimate() {
    if (!hasKey) {
      setManualReason("No API key yet, so Suki can't estimate this. Enter grams if you know them, or add a key in Settings.");
      setGrams(10);
      setStep('manual');
      return;
    }
    setStep('busy');
    const result = await estimateSugar(foodName, quantity || '1 serving');
    if (result) {
      setGrams(Math.round(result.sugarG));
      setNote(result.note);
      setStep('confirm');
    } else {
      setManualReason("Couldn't reach Gemini just now — enter grams if you know them, or skip.");
      setGrams(10);
      setStep('manual');
    }
  }

  async function commit(source: 'ai_estimated' | 'manual_fallback') {
    const name = foodName.trim() || 'Quick log';

    if (isEditRoute && editingEntry) {
      await editEntryInStore(editingEntry.id, {
        foodName: name,
        quantityDescription: quantity.trim() || undefined,
        sugarG: grams,
        sugarGSource: source,
      });
      router.back();
      return;
    }

    await addEntry({
      foodName: name,
      quantityDescription: quantity || undefined,
      sugarG: grams,
      sugarGSource: source,
      source: 'smart_log',
    });
    if (foodName.trim()) {
      await recordLog(foodName.trim().toLowerCase(), quantity, grams, source === 'ai_estimated');
    }
    const { isOverLimit, recoveryModalShown } = useLogStore.getState();
    if (isOverLimit && !recoveryModalShown) {
      router.replace('/recovery');
    } else {
      router.back();
    }
  }

  function confirmDelete() {
    if (!editingEntry) return;
    const label = editingEntry.foodName?.trim() || 'Quick log';
    const isRedeemed = editingEntry.source === 'redeemed';
    const body = isRedeemed
      ? `Removes ${Math.round(editingEntry.sugarG)}g from today's log. The Suki Points already spent on it are not refunded — this can't be undone.`
      : `Removes ${Math.round(editingEntry.sugarG)}g from today's log. This can't be undone.`;
    Alert.alert(`Delete "${label}"?`, body, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(editingEntry.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['bottom']}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 'pick' && (
          <View>
            <Text style={[styles.title, { color: t.text }]}>What did you have?</Text>
            <Text style={[styles.subtitle, { color: t.muted }]}>
              Suki works out the sugar — you just say what and how much.
            </Text>

            {picks.length > 0 && (
              <>
                <Text style={[styles.kicker, { color: t.faint }]}>YOUR REGULARS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                  {picks.map((p) => (
                    <Pressable
                      key={p.foodName}
                      onPress={() => pickFood(p.foodName, p.lastQuantityUsed)}
                      style={[styles.chip, { borderColor: t.line, backgroundColor: t.surface }]}
                    >
                      <View style={[styles.chipBadge, { backgroundColor: t.sageBg }]}>
                        <Text style={[styles.chipBadgeText, { color: t.sageInk }]}>{p.foodName.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Text style={{ color: t.text, fontFamily: fonts.body, fontSize: 13.5 }}>{p.foodName}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            <TextField
              value={foodName}
              onChangeText={setFoodName}
              placeholder="Search any food — gulab jamun, chai, mango…"
              autoFocus={picks.length === 0}
            />

            {suggestions.length > 0 && (
              <View style={[styles.suggestList, { backgroundColor: t.surface }]}>
                {suggestions.map((s) => (
                  <Pressable key={s.foodName} onPress={() => pickFood(s.foodName, s.lastQuantityUsed)} style={styles.suggestRow}>
                    <View style={[styles.suggestBadge, { backgroundColor: t.sageBg }]}>
                      <Text style={{ color: t.sageInk, fontSize: 11, fontFamily: fonts.heading }}>{s.foodName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.suggestName, { color: t.text }]}>{s.foodName}</Text>
                    <Text style={{ color: t.faint, fontSize: 11 }}>regular</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Button
              label="Continue"
              onPress={() => pickFood(foodName)}
              disabled={!foodName.trim()}
              fullWidth
              style={styles.continueBtn}
            />
            <View style={[styles.photoBtn, { borderColor: t.line }]}>
              <Camera size={17} color={t.muted} strokeWidth={iconStrokeWidth} />
              <Text style={{ color: t.muted, fontFamily: fonts.body, fontSize: 14 }}>Photo logging coming soon</Text>
            </View>
          </View>
        )}

        {step === 'qty' && (
          <View>
            <Pressable onPress={() => setStep('pick')} style={styles.backLink}>
              <Text style={{ color: t.faint, fontSize: 13 }}>‹ Change food</Text>
            </Pressable>
            <Text style={[styles.title, { color: t.text }]}>How much {foodName || 'was that'}?</Text>
            <Text style={[styles.subtitle, { color: t.muted }]}>Say it however you&apos;d say it out loud.</Text>

            <TextField
              value={quantity}
              onChangeText={setQuantity}
              placeholder="2 pieces · 1 katori · 250 gm · half a bowl"
              autoFocus
            />
            <View style={styles.chipsWrap}>
              {QUANTITY_CHIPS.map((q) => {
                const on = quantity === q;
                return (
                  <Pressable
                    key={q}
                    onPress={() => setQuantity(q)}
                    style={[styles.qtyChip, { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentBg : t.surface }]}
                  >
                    <Text style={{ color: t.text, fontSize: 13 }}>{q}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Button label={hasKey ? (isEditRoute ? 'Re-estimate' : 'Estimate') : 'Continue'} onPress={runEstimate} fullWidth />
            {isEditRoute && editingEntry && (
              <Pressable onPress={confirmDelete} style={styles.textLink}>
                <Text style={{ color: t.accentInk, fontSize: 14 }}>Delete entry</Text>
              </Pressable>
            )}
          </View>
        )}

        {step === 'busy' && (
          <View style={styles.busyWrap}>
            <SukiBunny mood="happy" size={96} />
            <Text style={[styles.busyTitle, { color: t.text }]}>Working out the sugar…</Text>
            <Text style={[styles.subtitle, { color: t.muted, textAlign: 'center' }]}>
              {quantity} of {foodName}
            </Text>
          </View>
        )}

        {step === 'confirm' && (
          <View>
            <View style={styles.confirmHeader}>
              <SukiBunny mood="happy" size={56} />
              <View style={styles.confirmHeaderText}>
                <Text style={[styles.confirmTitle, { color: t.text }]}>
                  ~{grams}g sugar in {quantity || 'that'} of {foodName}
                </Text>
                <Text style={[styles.subtitle, { color: t.muted, marginTop: 4, marginBottom: 0 }]}>
                  Looks right? Nudge it if you know better.
                </Text>
              </View>
            </View>
            <View style={[styles.gramsRow, { backgroundColor: t.surface }]}>
              <Stepper value={grams} onChange={setGrams} min={0} />
            </View>
            <Text style={[styles.estimateNote, { color: t.faint }]}>
              {note || 'Estimated by Gemini from your description'} · never exact, always close
            </Text>
            <Button label={isEditRoute ? 'Save changes' : 'Log it'} onPress={() => commit('ai_estimated')} fullWidth />
            <Pressable onPress={() => setStep('qty')} style={styles.textLink}>
              <Text style={{ color: t.faint, fontSize: 14 }}>Not quite — change the amount</Text>
            </Pressable>
            {isEditRoute && editingEntry && (
              <Pressable onPress={confirmDelete} style={styles.textLink}>
                <Text style={{ color: t.accentInk, fontSize: 14 }}>Delete entry</Text>
              </Pressable>
            )}
          </View>
        )}

        {step === 'locked' && (
          <View style={styles.busyWrap}>
            <SukiBunny mood="calm" size={80} />
            <Text style={[styles.busyTitle, { color: t.text }]}>
              {editLockReason === 'redeemed'
                ? "Redeemed treats can't be edited"
                : editLockReason === 'expired'
                  ? "Can't edit this one anymore"
                  : "Couldn't find that entry"}
            </Text>
            <Text style={[styles.subtitle, { color: t.muted, textAlign: 'center' }]}>
              {editLockReason === 'redeemed'
                ? "It's already spent — delete it instead if it was a mistake."
                : editLockReason === 'expired'
                  ? 'Entries lock 48 hours after logging to keep your points and streak history accurate.'
                  : 'It may have already been removed.'}
            </Text>
            {editLockReason === 'redeemed' && editingEntry && (
              <Pressable onPress={confirmDelete} style={styles.textLink}>
                <Text style={{ color: t.accentInk, fontSize: 14 }}>Delete entry</Text>
              </Pressable>
            )}
            <Button label="Close" onPress={() => router.back()} style={styles.lockedCloseBtn} />
          </View>
        )}

        {step === 'manual' && (
          <View>
            <View style={[styles.reasonBanner, { backgroundColor: t.accentBg }]}>
              <Text style={{ color: t.accentInk, fontSize: 13, lineHeight: 19.5 }}>{manualReason}</Text>
            </View>
            <View style={[styles.manualRow, { backgroundColor: t.surface }]}>
              <Text style={{ color: t.muted, fontSize: 13.5, flex: 1 }}>Sugar</Text>
              <Stepper value={grams} onChange={setGrams} min={0} size="sm" />
            </View>
            <Button label={`Log ${grams}g`} onPress={() => commit('manual_fallback')} fullWidth />
            {!hasKey && (
              <Pressable onPress={() => router.replace('/settings')} style={styles.textLink}>
                <Text style={{ color: t.faint, fontSize: 14 }}>Add an API key in Settings</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 10,
  },
  scrollContent: {
    padding: space[6],
    paddingTop: 14,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 12,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipsRow: {
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  chipBadge: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 9.5,
  },
  suggestList: {
    marginTop: 8,
    borderRadius: radii.lg - 2,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  suggestBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  continueBtn: {
    marginTop: 14,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 15,
    marginTop: 12,
  },
  backLink: {
    paddingBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  qtyChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  busyWrap: {
    alignItems: 'center',
    paddingVertical: 26,
    gap: 4,
  },
  busyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    marginTop: 12,
  },
  confirmHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  confirmHeaderText: {
    flex: 1,
  },
  confirmTitle: {
    fontFamily: fonts.heading,
    fontSize: 21,
    lineHeight: 26,
  },
  gramsRow: {
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  estimateNote: {
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  textLink: {
    alignItems: 'center',
    paddingVertical: 13,
  },
  reasonBanner: {
    borderRadius: radii.lg - 4,
    padding: 16,
    marginBottom: 14,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  lockedCloseBtn: {
    marginTop: 8,
  },
});
