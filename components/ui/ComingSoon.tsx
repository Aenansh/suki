import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

import { SukiBunny } from '../mascot/SukiBunny';
import { Button } from './Button';

type Props = {
  title: string;
  body: string;
};

/** Placeholder for routes not yet built in this milestone pass — keeps every design-mapped
 * route tappable end-to-end instead of 404ing while later milestones fill them in. */
export function ComingSoon({ title, body }: Props) {
  const t = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]}>
      <View style={styles.content}>
        <SukiBunny mood="calm" size={90} />
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        <Text style={[styles.body, { color: t.muted }]}>{body}</Text>
      </View>
      <Button label="Back" variant="secondary" onPress={() => router.back()} fullWidth />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: space[6],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
