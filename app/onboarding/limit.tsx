import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { fonts, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/userStore';

const MIN = 10;
const MAX = 60;

export default function OnboardingLimit() {
  const t = useAppTheme();
  const currentLimit = useUserStore((s) => s.dailyLimitG);
  const setLimit = useUserStore((s) => s.setLimit);
  const [limit, setLocalLimit] = useState(Math.round(currentLimit));

  const pct = ((limit - MIN) / (MAX - MIN)) * 100;

  const commitAndContinue = async () => {
    await setLimit(limit);
    router.push('/onboarding/goal');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <OnboardingProgress step={1} />
      <FadeInUp style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Set your daily budget</Text>
        <Text style={[styles.body, { color: t.muted }]}>
          Health guidance lands around 25g of added sugar. Start anywhere — change it any day, no penalty.
        </Text>

        <View style={styles.numberRow}>
          <Text style={[styles.number, { color: t.text }]}>{limit}</Text>
          <Text style={[styles.unit, { color: t.faint }]}>g</Text>
        </View>

        <View style={styles.stepperRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease daily limit"
            onPress={() => setLocalLimit((v) => Math.max(MIN, v - 1))}
            style={[styles.stepperButton, { borderColor: t.line, backgroundColor: t.surface }]}
          >
            <Text style={[styles.stepperGlyph, { color: t.text }]}>−</Text>
          </Pressable>
          <View style={[styles.track, { backgroundColor: t.track }]}>
            <View style={[styles.trackFill, { backgroundColor: t.accent, width: `${pct}%` }]} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase daily limit"
            onPress={() => setLocalLimit((v) => Math.min(MAX, v + 1))}
            style={[styles.stepperButton, { borderColor: t.line, backgroundColor: t.surface }]}
          >
            <Text style={[styles.stepperGlyph, { color: t.text }]}>+</Text>
          </Pressable>
        </View>

        <View style={[styles.tip, { backgroundColor: t.sageBg }]}>
          <View style={styles.tipMascot}>
            <SukiBunny mood="happy" size={46} />
          </View>
          <Text style={[styles.tipText, { color: t.sageInk }]}>
            Most people land between 25 and 40g. Every gram under your budget becomes a Suki Point.
          </Text>
        </View>
      </FadeInUp>

      <OnboardingFooter nextLabel="Continue" onNext={commitAndContinue} onBack={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space[6],
    paddingBottom: space[6],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 31,
    marginBottom: 8,
    lineHeight: 34,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  number: {
    fontFamily: fonts.heading,
    fontSize: 78,
    lineHeight: 78,
  },
  unit: {
    fontFamily: fonts.heading,
    fontSize: 26,
    marginLeft: 4,
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    marginBottom: 26,
  },
  stepperButton: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperGlyph: {
    fontFamily: fonts.heading,
    fontSize: 26,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.lg,
    padding: 16,
  },
  tipMascot: {
    width: 46,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19.5,
  },
});
