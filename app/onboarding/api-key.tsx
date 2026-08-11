import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { Button, FadeInUp, TextField } from '@/components/ui';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { setApiKey, validateApiKey } from '@/services/apiKey';
import { useToastStore } from '@/stores/toastStore';

const GET_KEY_URL = 'https://aistudio.google.com/apikey';

export default function OnboardingApiKey() {
  const t = useAppTheme();
  const showToast = useToastStore((s) => s.show);
  const [keyDraft, setKeyDraft] = useState('');
  const [checking, setChecking] = useState(false);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  function editKeyDraft(v: string) {
    setKeyDraft(v);
    if (invalidReason) setInvalidReason(null); // stale error shouldn't linger past an edit
  }

  // Blocking, unlike Settings' key update (which never blocks a save): a typo caught right now,
  // during setup, is cheap to fix; leaving the field blank still skips through immediately —
  // this only gates people who typed *something* that doesn't check out.
  const commitAndContinue = async () => {
    const trimmed = keyDraft.trim();
    if (!trimmed) {
      router.push('/onboarding/done');
      return;
    }
    setChecking(true);
    const result = await validateApiKey(trimmed);
    setChecking(false);
    if (result.valid) {
      await setApiKey(trimmed);
      showToast('Key saved — smart logging is unlocked.', 'success');
      router.push('/onboarding/done');
    } else {
      setInvalidReason(result.reason);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <OnboardingProgress step={3} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <FadeInUp>
          <View style={styles.headerRow}>
            <SukiBunny mood="happy" size={64} />
            <Text style={[styles.title, { color: t.text }]}>Power up Suki</Text>
          </View>
          <Text style={[styles.body, { color: t.muted }]}>
            Suki uses a little AI magic to work out the sugar in whatever you ate — &quot;two gulab jamun&quot; is
            enough. Paste your free Gemini key below to unlock it.
          </Text>

          <TextField
            value={keyDraft}
            onChangeText={editKeyDraft}
            placeholder="Paste your key here"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!checking}
          />

          {invalidReason && (
            <View style={[styles.errorNotice, { backgroundColor: t.accentBg }]}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={t.accentInk} strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" style={styles.skipIcon}>
                <Path d="M12 11v5M12 7.6v.4" />
                <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </Svg>
              <Text style={[styles.skipText, { color: t.accentInk }]}>
                {invalidReason} — fix it above, or clear the field to skip and add a key later in Settings.
              </Text>
            </View>
          )}

          <View style={styles.lockRow}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={t.sageInk2} strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M7 11V8a5 5 0 0110 0v3M5.5 11h13v9h-13z" />
            </Svg>
            <Text style={[styles.lockText, { color: t.muted }]}>Stored on this phone only. It never touches a Suki server.</Text>
          </View>

          <View style={[styles.freeCard, { backgroundColor: t.sageBg }]}>
            <Text style={[styles.freeTitle, { color: t.sageInk }]}>Don&apos;t have one? It&apos;s free.</Text>
            <Text style={[styles.freeBody, { color: t.sageInk }]}>
              Google gives every account a free Gemini key — takes about a minute.
            </Text>
            <Button label="Get a free key" variant="secondary" onPress={() => Linking.openURL(GET_KEY_URL)} />
          </View>

          {!keyDraft && (
            <View style={[styles.skipNotice, { backgroundColor: t.accentBg }]}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={t.accentInk} strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" style={styles.skipIcon}>
                <Path d="M12 11v5M12 7.6v.4" />
                <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </Svg>
              <Text style={[styles.skipText, { color: t.accentInk }]}>
                Skip if you like — you&apos;ll just type sugar grams yourself when logging. You can add a key any
                time in Settings.
              </Text>
            </View>
          )}
        </FadeInUp>
      </ScrollView>

      <OnboardingFooter
        nextLabel="Continue"
        onNext={commitAndContinue}
        onBack={() => router.back()}
        nextLoading={checking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space[6],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: space[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 29,
    marginBottom: 4,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21.7,
    marginBottom: 18,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 2,
  },
  lockText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
  freeCard: {
    borderRadius: radii.lg,
    padding: 17,
    gap: 10,
  },
  freeTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  freeBody: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    opacity: 0.85,
    marginTop: -6,
  },
  skipNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    padding: 16,
    borderRadius: radii.lg,
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
    padding: 16,
    borderRadius: radii.lg,
  },
  skipIcon: {
    marginTop: 1,
  },
  skipText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
