import { CircleAlert, Check } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, iconStrokeWidth, radii } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToastStore } from '@/stores/toastStore';

/** Rendered once at the root (app/_layout.tsx) so a toast survives screen transitions — e.g.
 * firing right as onboarding/api-key.tsx navigates on to the next step. */
export function Toast() {
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const variant = useToastStore((s) => s.variant);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [message, progress]);

  if (!message) return null;

  const Icon = variant === 'success' ? Check : CircleAlert;
  const iconBg = variant === 'success' ? '#7a8a5e' : '#c67139';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          backgroundColor: t.toast,
          bottom: insets.bottom + 24,
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={14} color="#fff" strokeWidth={iconStrokeWidth} />
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.lg - 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 10,
    zIndex: 100,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 18.9,
    color: '#f5ead8',
  },
});
