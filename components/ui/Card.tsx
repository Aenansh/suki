import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Card background — most screens use the surface tint; a few (points balance, SOS cards) use a role tint instead. */
  backgroundColor?: string;
};

/** Matches .card from the Organic design system — surface fill, ~32px radius. */
export function Card({ children, style, backgroundColor }: Props) {
  const t = useAppTheme();
  return <View style={[styles.card, { backgroundColor: backgroundColor ?? t.surface }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: space[4],
  },
});
