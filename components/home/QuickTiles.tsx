import { router } from 'expo-router';
import { Calendar, Flame, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, iconStrokeWidth, radii } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  streakDays: number;
  points: number;
};

/** The three quick-stat tiles below the SOS card — Streak → /badges, Points → points tab, History → history tab. */
export function QuickTiles({ streakDays, points }: Props) {
  const t = useAppTheme();
  const monthLabel = new Date().toLocaleDateString(undefined, { month: 'long' });

  const tiles = [
    { value: `${streakDays}d`, label: 'Streak', iconBg: t.sageBg, Icon: Flame, iconColor: t.sageInk, go: () => router.push('/badges') },
    { value: `${Math.round(points)}`, label: 'Points', iconBg: t.goldBg, Icon: Star, iconColor: t.goldInk, go: () => router.push('/(tabs)/points') },
    { value: monthLabel, label: 'History', iconBg: t.accentBg, Icon: Calendar, iconColor: t.accentInk, go: () => router.push('/(tabs)/history') },
  ];

  return (
    <View style={styles.row}>
      {tiles.map((tile) => (
        <Pressable key={tile.label} onPress={tile.go} style={[styles.tile, { backgroundColor: t.surface }]}>
          <View style={styles.tileTop}>
            <View style={[styles.iconWrap, { backgroundColor: tile.iconBg }]}>
              <tile.Icon size={15} color={tile.iconColor} strokeWidth={iconStrokeWidth} />
            </View>
          </View>
          <Text style={[styles.value, { color: t.text }]} numberOfLines={1}>
            {tile.value}
          </Text>
          <Text style={[styles.label, { color: t.muted }]}>{tile.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: radii.lg - 2,
    padding: 13,
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 2,
  },
});
