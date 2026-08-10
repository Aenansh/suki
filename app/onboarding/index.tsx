import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { SukiBunny } from '@/components/mascot/SukiBunny';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { fonts, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function OnboardingWelcome() {
  const t = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <FadeInUp style={styles.hero}>
        <View style={styles.mascotWrap}>
          <View style={[styles.mascotBackdrop, { backgroundColor: t.sageBg }]} />
          <SukiBunny mood="happy" size={212} />
        </View>
        <Text style={[styles.title, { color: t.text }]}>Hi, I&apos;m Suki.</Text>
        <Text style={[styles.body, { color: t.muted }]}>
          I help you spend your sugar, not just cut it. No red screens, no lectures — a number, a nudge, and points
          for every gram you save.
        </Text>
      </FadeInUp>

      <OnboardingFooter nextLabel="Let's go" onNext={() => router.push('/onboarding/limit')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space[6],
    paddingBottom: space[6],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotWrap: {
    width: 212,
  },
  mascotBackdrop: {
    position: 'absolute',
    left: -14,
    right: -14,
    top: 44,
    bottom: -6,
    borderRadius: 999,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 35,
    marginTop: 24,
    lineHeight: 38,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15.5,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
