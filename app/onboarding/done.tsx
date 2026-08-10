import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { FadeInUp, Tag } from '@/components/ui';
import { fonts, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/userStore';

export default function OnboardingDone() {
  const t = useAppTheme();
  const limit = useUserStore((s) => Math.round(s.dailyLimitG));
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <OnboardingProgress step={4} />
      <FadeInUp style={styles.content}>
        <View style={styles.mascotWrap}>
          <View style={[styles.mascotBackdrop, { backgroundColor: t.accentBg }]} />
          <SukiBunny mood="cheer" size={202} />
        </View>
        <Text style={[styles.title, { color: t.text }]}>You&apos;re all set.</Text>
        <Text style={[styles.body, { color: t.muted }]}>
          {limit}g a day, starting now. Log one thing today and your streak begins.
        </Text>
        <View style={styles.tags}>
          <Tag label="1 pt per gram saved" variant="sage" />
          <Tag label="+10 clean-day bonus" variant="gold" />
        </View>
      </FadeInUp>

      <OnboardingFooter nextLabel="Start tracking" onNext={finish} onBack={() => router.back()} />
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
    alignItems: 'center',
  },
  mascotWrap: {
    width: 202,
  },
  mascotBackdrop: {
    position: 'absolute',
    left: -16,
    right: -16,
    top: 40,
    bottom: -4,
    borderRadius: 999,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 33,
    marginTop: 22,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginHorizontal: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
