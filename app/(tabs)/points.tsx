import { router, useFocusEffect } from 'expo-router';
import { CupSoda, Droplet, Leaf, Search, Star } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STARTER_TREATS, type TreatIcon, type TreatSwatch } from '@/constants/starterTreats';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { hasRedeemedToday } from '@/db/queries/entries';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePointsStore } from '@/stores/pointsStore';
import { useUserStore } from '@/stores/userStore';
import { getTodayDateString } from '@/utils/date';

const TREAT_ICONS: Record<TreatIcon, typeof Droplet> = { drop: Droplet, cup: CupSoda, star: Star, leaf: Leaf };

const EARN_RULES = [
  { pts: '1 pt', text: 'per gram under your daily budget' },
  { pts: '+10', text: 'bonus for a full day under' },
  { pts: '+15', text: 'each craving you ride out in SOS' },
  { pts: '+25', text: 'every 7 days logged in a row' },
];

export default function Points() {
  const t = useAppTheme();
  const points = useUserStore((s) => s.sukiPoints);
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const pendingSpToday = usePointsStore((s) => s.pendingSpToday);
  const computePendingSP = usePointsStore((s) => s.computePendingSP);
  const [redeemedToday, setRedeemedToday] = useState(false);

  useEffect(() => {
    computePendingSP();
  }, [computePendingSP, dailyLimitG]);

  // Re-checked every time this tab gains focus (not just on mount) — the count needs to catch a
  // redemption made moments ago on the redeem screen, and roll over correctly past midnight.
  useFocusEffect(
    useCallback(() => {
      hasRedeemedToday(getTodayDateString()).then(setRedeemedToday);
    }, [])
  );

  const swatchColor: Record<TreatSwatch, string> = { accent: t.accentBg, sage: t.sageBg, gold: t.goldBg };

  function openRedeem(item?: string) {
    if (redeemedToday) return;
    router.push(item ? { pathname: '/redeem', params: { item } } : '/redeem');
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.balanceCard, { backgroundColor: t.goldBg }]}>
          <Text style={[styles.balanceKicker, { color: t.goldInk }]}>SUKI POINTS</Text>
          <Text style={[styles.balanceValue, { color: t.goldInk }]}>{Math.round(points)}</Text>
          <Text style={[styles.balancePending, { color: t.goldInk }]}>
            {pendingSpToday > 0 ? `${pendingSpToday} pending from today` : 'No grams saved today — tomorrow resets it'}
          </Text>
        </View>

        <View style={[styles.earnCard, { backgroundColor: t.surface }]}>
          <Text style={[styles.earnTitle, { color: t.text }]}>How you earn</Text>
          {EARN_RULES.map((r) => (
            <View key={r.text} style={styles.earnRow}>
              <Text style={[styles.earnPts, { color: t.sageInk2 }]}>{r.pts}</Text>
              <Text style={[styles.earnText, { color: t.muted }]}>{r.text}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: t.text }]}>Redeem a treat</Text>
        <Text style={[styles.sectionSub, { color: t.muted }]}>
          {redeemedToday
            ? "You've claimed today's treat — the shelf reopens tomorrow."
            : 'Anything sweet is fair game. Tell Suki what and how much — priced at a premium so it feels earned.'}
        </Text>

        <View style={[styles.grid, redeemedToday && styles.dimmed]} pointerEvents={redeemedToday ? 'none' : 'auto'}>
          {STARTER_TREATS.map((treat) => {
            const Icon = TREAT_ICONS[treat.icon];
            return (
              <Pressable
                key={treat.name}
                onPress={() => openRedeem(treat.name.toLowerCase())}
                style={[styles.gridItem, { backgroundColor: t.surface }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: swatchColor[treat.swatch] }]}>
                  <Icon size={18} color={t.text} strokeWidth={iconStrokeWidth} />
                </View>
                <Text style={[styles.gridLabel, { color: t.text }]} numberOfLines={1}>
                  {treat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => openRedeem()}
          disabled={redeemedToday}
          style={[styles.somethingElse, { borderColor: t.accent }, redeemedToday && styles.dimmed]}
        >
          <View style={[styles.somethingIcon, { backgroundColor: t.accentBg }]}>
            <Search size={18} color={t.accentInk} strokeWidth={iconStrokeWidth} />
          </View>
          <View style={styles.somethingText}>
            <Text style={[styles.somethingTitle, { color: t.text }]}>Something else?</Text>
            <Text style={[styles.somethingSub, { color: t.muted }]}>Ghewar, mysore pak, that thing your aunt makes</Text>
          </View>
        </Pressable>

        <View style={styles.scrollSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[6],
    paddingTop: 12,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: radii.card,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceKicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  balanceValue: {
    fontFamily: fonts.heading,
    fontSize: 62,
    lineHeight: 65,
  },
  balancePending: {
    fontSize: 13,
    opacity: 0.85,
  },
  earnCard: {
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 22,
  },
  earnTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    marginBottom: 8,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
  },
  earnPts: {
    fontFamily: fonts.heading,
    fontSize: 14,
    minWidth: 46,
  },
  earnText: {
    fontSize: 13.5,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dimmed: {
    opacity: 0.45,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    gap: 7,
    borderRadius: radii.lg - 6,
    paddingVertical: 11,
    paddingHorizontal: 5,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 10.5,
    textAlign: 'center',
  },
  somethingElse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 10,
  },
  somethingIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  somethingText: {
    flex: 1,
  },
  somethingTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  somethingSub: {
    fontSize: 12.5,
    marginTop: 1,
  },
  scrollSpacer: {
    height: 8,
  },
});
