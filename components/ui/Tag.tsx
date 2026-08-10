import { StyleSheet, Text, View } from 'react-native';

import { fonts, radii, ramp, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Variant = 'accent' | 'sage' | 'gold' | 'neutral' | 'outline';

type Props = {
  label: string;
  variant?: Variant;
};

/** Matches .tag-accent/.tag-accent-2/.tag-neutral/.tag-outline. */
export function Tag({ label, variant = 'neutral' }: Props) {
  const t = useAppTheme();

  const styleFor: Record<Variant, { bg: string; ink: string; border?: string }> = {
    accent: { bg: t.scheme === 'dark' ? t.accentBg : ramp.accent[100], ink: t.accentInk },
    sage: { bg: t.sageBg, ink: t.sageInk },
    gold: { bg: t.goldBg, ink: t.goldInk },
    neutral: { bg: t.scheme === 'dark' ? t.surface : ramp.neutral[100], ink: t.muted },
    outline: { bg: 'transparent', ink: t.accent, border: t.accent },
  };
  const s = styleFor[variant];

  return (
    <View style={[styles.tag, { backgroundColor: s.bg, borderColor: s.border ?? 'transparent', borderWidth: s.border ? 1 : 0 }]}>
      <Text style={[styles.label, { color: s.ink }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radii.md * 0.75,
    paddingHorizontal: space[3],
    paddingVertical: 3,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
