import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radii } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** 'lg' matches the onboarding limit dial; 'sm' matches the log-sheet grams row. */
  size?: 'lg' | 'sm';
};

/** The circular −/+ stepper reused across onboarding limit, log confirm, and manual fallback. */
export function Stepper({ value, onChange, min = 0, max = Infinity, step = 1, unit = 'g', size = 'sm' }: Props) {
  const t = useAppTheme();
  const btn = size === 'lg' ? 54 : 46;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${unit}`}
        onPress={() => onChange(Math.max(min, value - step))}
        style={[styles.btn, { width: btn, height: btn, borderColor: t.line, backgroundColor: t.bg }]}
      >
        <Text style={[styles.glyph, { color: t.text }]}>−</Text>
      </Pressable>
      <Text style={[styles.value, { color: t.text }, size === 'lg' && styles.valueLg]}>
        {value}
        {unit}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${unit}`}
        onPress={() => onChange(Math.min(max, value + step))}
        style={[styles.btn, { width: btn, height: btn, borderColor: t.line, backgroundColor: t.bg }]}
      >
        <Text style={[styles.glyph, { color: t.text }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  btn: {
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  value: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.heading,
    fontSize: 26,
    minWidth: 58,
  },
  valueLg: {
    fontSize: 32,
  },
});
