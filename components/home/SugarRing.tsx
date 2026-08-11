import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSugarStatus } from '@/hooks/useSugarStatus';

const SIZE = 238;
const R = 100;
const STROKE = 21;
const CIRCUMFERENCE = 2 * Math.PI * R;

type Props = {
  sugar: number;
  limit: number;
  /** Sub-label under the gram count — "today" on Home, something past-tense on a day-detail view
   * (app/day/[date].tsx). Defaults to "today" so Home's existing usage is unaffected. */
  label?: string;
};

/** The home dashboard's sugar progress ring — matches Suki.dc.html's ringDash/ringColor logic.
 * Reused on app/day/[date].tsx for a past day's total too (via the `label` prop). */
export function SugarRing({ sugar, limit, label = 'today' }: Props) {
  const t = useAppTheme();
  const { pct, ringColor, mascotMood } = useSugarStatus(sugar, limit);
  const dash = pct * CIRCUMFERENCE;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
        <G rotation={-90} origin="120, 120">
          <Circle cx={120} cy={120} r={R} fill="none" stroke={t.track} strokeWidth={STROKE} />
          <Circle
            cx={120}
            cy={120}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash}, ${CIRCUMFERENCE}`}
          />
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.sugar, { color: t.text }]}>
          {Math.round(sugar)}
          <Text style={styles.sugarUnit}>g</Text>
        </Text>
        <Text style={[styles.sub, { color: t.muted }]}>of {Math.round(limit)}g {label}</Text>
      </View>
      <View style={styles.mascot}>
        <SukiBunny mood={mascotMood} size={74} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    position: 'relative',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sugar: {
    fontFamily: fonts.heading,
    fontSize: 54,
    lineHeight: 54,
  },
  sugarUnit: {
    fontSize: 23,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 3,
  },
  mascot: {
    position: 'absolute',
    right: -14,
    bottom: -6,
    width: 74,
  },
});
