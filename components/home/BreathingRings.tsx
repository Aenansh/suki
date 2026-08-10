import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

type Props = {
  color: string;
  delay?: number;
};

/** One pulsing ring behind the SOS mascot — matches the design's `sukiBreathe` keyframe
 * (scale .82→1.08, opacity .5→.95, 5.5s ease-in-out, staggered). Stack two with delay=0/600. */
export function BreathingRing({ color, delay = 0 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2750, delay, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 2750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, delay]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.08] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.95] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { backgroundColor: color, transform: [{ scale }], opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
});
