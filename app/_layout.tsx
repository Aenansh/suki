import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { fontAssets } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMidnightCheck } from '@/hooks/useMidnightCheck';
import { useUserStore } from '@/stores/userStore';

SplashScreen.preventAutoHideAsync();

/** Root layout — the one place that does font load, DB init (via userStore.loadUser), the
 * midnight rollover check, and the onboarding gate. Screens never touch db/ directly; they read
 * stores. */
export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [userLoaded, setUserLoaded] = useState(false);
  const loadUser = useUserStore((s) => s.loadUser);
  const t = useAppTheme();

  useEffect(() => {
    loadUser().finally(() => setUserLoaded(true));
  }, [loadUser]);

  // Runs once userLoaded flips true (DB is guaranteed open by then) — holds the splash screen
  // so no screen can mount and read pre-rollover streak/points for a frame.
  const midnightChecked = useMidnightCheck(userLoaded);

  const ready = fontsLoaded && userLoaded && midnightChecked;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      {/* initialRouteName is required here — otherwise React Navigation defaults to whichever
          Stack.Screen is registered first below (log), skipping the onboarding gate entirely. */}
      <Stack initialRouteName="index" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recovery" options={{ presentation: 'modal' }} />
        <Stack.Screen name="redeem" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
