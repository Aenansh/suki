import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  /** 1-indexed current step out of `total`. */
  step: number;
  total?: number;
};

/** The onboarding dot strip — one segment per wizard step (limit / goal / api-key / done). */
export function OnboardingProgress({ step, total = 4 }: Props) {
  const t = useAppTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i < step ? t.accent : t.track }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 5,
    flex: 1,
    borderRadius: 999,
  },
});
