import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { GOALS, type GoalId } from '@/constants/goals';
import { fonts, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/userStore';

export default function OnboardingGoal() {
  const t = useAppTheme();
  const currentGoal = useUserStore((s) => s.goal);
  const setGoal = useUserStore((s) => s.setGoal);
  const [selected, setSelected] = useState<GoalId | null>((currentGoal as GoalId) ?? null);

  const commitAndContinue = async () => {
    if (!selected) return;
    await setGoal(selected);
    router.push('/onboarding/api-key');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <OnboardingProgress step={2} />
      <FadeInUp style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>What brings you here?</Text>
        <Text style={[styles.body, { color: t.muted }]}>This shapes the nudges Suki gives you — not your budget.</Text>

        <View style={styles.list}>
          {GOALS.map((g) => {
            const on = selected === g.id;
            return (
              <Pressable
                key={g.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setSelected(g.id)}
                style={[
                  styles.option,
                  { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentBg : t.surface },
                ]}
              >
                <View style={[styles.dot, { borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : 'transparent' }]}>
                  {on && (
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M20 6L9 17l-5-5" />
                    </Svg>
                  )}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: t.text }]}>{g.title}</Text>
                  <Text style={[styles.optionSub, { color: t.muted }]}>{g.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </FadeInUp>

      <OnboardingFooter
        nextLabel="Continue"
        onNext={commitAndContinue}
        onBack={() => router.back()}
        nextDisabled={!selected}
      />
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
    marginBottom: 18,
  },
  list: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: 16,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  optionSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    marginTop: 2,
  },
});
