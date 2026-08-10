import { router, useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { Button, TextField } from '@/components/ui';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { hasRedeemedToday } from '@/db/queries/entries';
import { useAppTheme } from '@/hooks/useAppTheme';
import { estimateSugar } from '@/services/gemini';
import { useLogStore } from '@/stores/logStore';
import { useUserStore } from '@/stores/userStore';
import { getTodayDateString } from '@/utils/date';
import { calculateRedeemCost } from '@/utils/redeemPricing';

type Step = 'checking' | 'already' | 'ask' | 'busy' | 'confirm';

function title(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Redeem() {
  const t = useAppTheme();
  const params = useLocalSearchParams<{ item?: string }>();
  const points = useUserStore((s) => s.sukiPoints);
  const deductPoints = useUserStore((s) => s.deductPoints);
  const addEntry = useLogStore((s) => s.addEntry);

  const [step, setStep] = useState<Step>('checking');
  const [item, setItem] = useState(params.item ?? '');
  const [quantity, setQuantity] = useState('');
  const [grams, setGrams] = useState(0);

  useEffect(() => {
    if (params.item) setItem(params.item);
  }, [params.item]);

  // At most one redemption per day (docs/prd/02-PRD-Suki.md "Redemption Economy") — checked
  // fresh every time this screen opens rather than trusted from stale state.
  useEffect(() => {
    hasRedeemedToday(getTodayDateString()).then((already) => setStep(already ? 'already' : 'ask'));
  }, []);

  // A 25% premium over the raw sugar grams — see utils/redeemPricing.ts for why a flat 1:1 rate
  // doesn't work (it makes redeeming a wash against what an under-budget day just earned you).
  const cost = calculateRedeemCost(grams);
  const balAfter = points - cost;
  const canAfford = balAfter >= 0;

  async function priceItUp() {
    if (!item.trim()) return;
    setStep('busy');
    const result = await estimateSugar(item, quantity || '1 serving');
    setGrams(result ? Math.round(result.sugarG) : 10);
    setStep('confirm');
  }

  async function confirmRedeem() {
    if (!canAfford) return;
    // Re-check right before committing — guards a redemption opened just before midnight from
    // landing on the wrong day, and a second redeem tab/screen open at the same time.
    if (await hasRedeemedToday(getTodayDateString())) {
      setStep('already');
      return;
    }
    await deductPoints(cost);
    await addEntry({
      foodName: title(item.trim()),
      quantityDescription: quantity || undefined,
      sugarG: grams,
      sugarGSource: 'ai_estimated',
      source: 'redeemed',
      redeemedTreat: title(item.trim()),
    });
    router.back();
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['bottom']}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 'checking' && (
          <View style={styles.busyWrap}>
            <SukiBunny mood="happy" size={80} />
          </View>
        )}

        {step === 'already' && (
          <View style={styles.busyWrap}>
            <SukiBunny mood="warm" size={88} />
            <Text style={[styles.busyTitle, { color: t.text }]}>Today&apos;s treat is already claimed</Text>
            <Text style={[styles.subtitle, { color: t.muted, textAlign: 'center', marginTop: 6 }]}>
              One redemption a day keeps it a real treat, not a habit. Come back tomorrow for the next one.
            </Text>
            <Button label="Okay" onPress={() => router.back()} fullWidth style={styles.alreadyBtn} />
          </View>
        )}

        {step === 'ask' && (
          <View>
            <Text style={[styles.title, { color: t.text }]}>{item.trim() ? `${title(item.trim())}, then` : 'Redeem anything sweet'}</Text>
            <Text style={[styles.subtitle, { color: t.muted }]}>Sugar becomes the price — Suki works it out, then you decide.</Text>

            <TextField value={item} onChangeText={setItem} placeholder="What sweet? e.g. ghewar" style={styles.fieldGap} />
            <TextField
              value={quantity}
              onChangeText={setQuantity}
              placeholder="How much? e.g. 2 pieces"
              style={[styles.fieldGap, { borderColor: t.accent }]}
            />

            <Button
              label="Price it up"
              icon={<Sparkles size={18} color="#fff" strokeWidth={iconStrokeWidth} />}
              onPress={priceItUp}
              disabled={!item.trim()}
              fullWidth
            />
          </View>
        )}

        {step === 'busy' && (
          <View style={styles.busyWrap}>
            <SukiBunny mood="happy" size={92} />
            <Text style={[styles.busyTitle, { color: t.text }]}>Pricing that up…</Text>
            <Text style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>
              {quantity || '1 serving'} of {item}
            </Text>
          </View>
        )}

        {step === 'confirm' && (
          <View>
            <View style={[styles.priceCard, { backgroundColor: t.goldBg }]}>
              <Text style={{ color: t.goldInk, fontSize: 12.5, opacity: 0.85 }}>
                {quantity || '1 serving'} of {item}
              </Text>
              <Text style={[styles.priceValue, { color: t.goldInk }]}>{cost} SP</Text>
              <Text style={{ color: t.goldInk, fontSize: 13 }}>≈ {grams}g sugar · priced at a premium so it's worth earning</Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={{ color: t.muted, fontSize: 13.5 }}>Balance after</Text>
              <Text style={{ color: canAfford ? t.sageInk2 : t.accentInk, fontFamily: fonts.heading, fontSize: 15 }}>
                {canAfford ? `${balAfter} pts` : 'not enough'}
              </Text>
            </View>

            <Button
              label={canAfford ? `Redeem for ${cost} SP` : `Need ${cost - points} more SP`}
              onPress={confirmRedeem}
              disabled={!canAfford}
              fullWidth
            />
            <Pressable onPress={() => setStep('ask')} style={styles.textLink}>
              <Text style={{ color: t.faint, fontSize: 14 }}>Change it</Text>
            </Pressable>
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
    fontSize: 23,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 14,
  },
  fieldGap: {
    marginBottom: 10,
  },
  busyWrap: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  busyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  alreadyBtn: {
    marginTop: 18,
  },
  priceCard: {
    borderRadius: radii.lg,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  priceValue: {
    fontFamily: fonts.heading,
    fontSize: 44,
    lineHeight: 48,
    marginTop: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 14,
  },
  textLink: {
    alignItems: 'center',
    paddingVertical: 13,
  },
});
