import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, pressedOpacity, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

type Props = {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Icon element, e.g. a lucide-react-native icon. Placed left of the label, or centered for `icon`. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Matches .btn/.btn-primary/.btn-secondary/.btn-ghost/.btn-icon from the Organic design system. */
export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, fullWidth, style }: Props) {
  const t = useAppTheme();

  const bg =
    variant === 'primary' ? t.accent : variant === 'secondary' || variant === 'icon' ? 'transparent' : 'transparent';
  const border = variant === 'secondary' || variant === 'icon' ? t.line : 'transparent';
  const textColor = variant === 'primary' ? '#fff' : variant === 'ghost' ? t.accent : t.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'icon' && styles.iconOnly,
        variant !== 'icon' && { paddingHorizontal: space[4] * 1.2, paddingVertical: space[3] },
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'secondary' || variant === 'icon' ? 1 : 0 },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && { opacity: pressedOpacity },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          {label ? <Text style={[styles.label, { color: textColor }]}>{label}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnly: {
    width: 40,
    height: 40,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
});
