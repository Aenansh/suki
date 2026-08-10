import { Redirect } from 'expo-router';

import { useUserStore } from '@/stores/userStore';

/** Onboarding gate: app/_layout.tsx guarantees the user row is loaded before this mounts. */
export default function Index() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />;
}
