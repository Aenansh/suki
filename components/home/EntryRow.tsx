import { ChevronRight, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tag } from '@/components/ui';
import type { Entry } from '@/db/types';
import { fonts, iconStrokeWidth, radii } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  entry: Entry;
  onPress?: () => void;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** A single logged-today row — chip color flags heavier (15g+) entries, matching the design.
 * Tappable to edit/delete (within the 48h window — see utils/entryEditWindow.ts). Redeemed
 * treats get a gold "Redeemed" tag and are excluded from the ring/limit — see
 * utils/sugarBudget.ts — so it's visible why this row doesn't move today's total. */
export function EntryRow({ entry, onPress }: Props) {
  const t = useAppTheme();
  const redeemed = entry.source === 'redeemed';
  const heavy = entry.sugarG >= 15;
  const chipBg = redeemed ? t.goldBg : heavy ? t.accentBg : t.sageBg;
  const chipInk = redeemed ? t.goldInk : heavy ? t.accentInk : t.sageInk;
  const name = entry.foodName?.trim() || 'Quick log';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Edit ${name}, ${Math.round(entry.sugarG)} grams` : undefined}
      style={[styles.row, { backgroundColor: t.surface }]}
    >
      <View style={[styles.chip, { backgroundColor: chipBg }]}>
        {redeemed ? (
          <Star size={15} color={chipInk} strokeWidth={iconStrokeWidth} />
        ) : (
          <Text style={[styles.chipText, { color: chipInk }]}>{name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.time, { color: t.faint }]}>{formatTime(entry.timestamp)}</Text>
      </View>
      {redeemed && <Tag label="Redeemed" variant="gold" />}
      <Text style={[styles.grams, { color: t.text }]}>{Math.round(entry.sugarG)}g</Text>
      {onPress && <ChevronRight size={14} color={t.faint} strokeWidth={2} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radii.lg - 4,
  },
  chip: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: fonts.heading,
    fontSize: 11,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 1,
  },
  grams: {
    fontFamily: fonts.heading,
    fontSize: 17,
  },
});
