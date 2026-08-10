import { router } from 'expo-router';
import { ArrowLeft, Check, Flame, Leaf, Lock, RefreshCw, Star, Target } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { BADGE_DEFINITIONS, type BadgeIcon } from '@/constants/badgeDefinitions';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { getEntriesBetween } from '@/db/queries/entries';
import { getUnlockedBadges } from '@/db/queries/badges';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStreakStore } from '@/stores/streakStore';
import { useUserStore } from '@/stores/userStore';
import { addDays, getTodayDateString } from '@/utils/date';
import { budgetRelevantEntries } from '@/utils/sugarBudget';

const BADGE_ICONS: Record<BadgeIcon, typeof Flame> = { flame: Flame, swap: RefreshCw, leaf: Leaf, target: Target, star: Star };

type DayStatus = 'good' | 'over' | 'missed' | 'today';

export default function Badges() {
  const t = useAppTheme();
  const streakDays = useStreakStore((s) => s.currentStreak);
  const lastLoggedDate = useStreakStore((s) => s.lastLoggedDate);
  const loadStreak = useStreakStore((s) => s.loadStreak);
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const [week, setWeek] = useState<{ label: string; status: DayStatus }[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Defensive reload — the tab bar's Home screen loads streak on its own mount too, but this
    // screen shouldn't depend on Home having run first (e.g. deep links, faster navigation).
    loadStreak();
  }, [loadStreak]);

  useEffect(() => {
    (async () => {
      const today = getTodayDateString();
      const start = addDays(today, -6);
      const entries = await getEntriesBetween(start, today);
      const totalsByDate = new Map<string, number>();
      for (const e of budgetRelevantEntries(entries)) {
        totalsByDate.set(e.date, (totalsByDate.get(e.date) ?? 0) + e.sugarG);
      }
      const days: { label: string; status: DayStatus }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = addDays(today, -i);
        const label = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' });
        const total = totalsByDate.get(date);
        const status: DayStatus = date === today && total === undefined ? 'today' : total === undefined ? 'missed' : total > dailyLimitG ? 'over' : 'good';
        days.push({ label, status });
      }
      setWeek(days);

      const badges = await getUnlockedBadges();
      setUnlockedIds(new Set(badges.map((b) => b.badgeId)));
    })();
  }, [dailyLimitG]);

  // The streak count only finalizes at midnight rollover (services/midnight.ts) — today's log
  // doesn't bump `current_streak` until tomorrow. Without this, a same-day tester sees a bare
  // "0" that reads as broken rather than "counts tonight".
  const today = getTodayDateString();
  const todayLoggedButNotCredited = week.length === 7 && week[6].status !== 'today' && week[6].status !== 'missed' && lastLoggedDate !== today;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: t.line }]}
        >
          <ArrowLeft size={17} color={t.text} strokeWidth={iconStrokeWidth} />
        </Pressable>

        <View style={[styles.streakCard, { backgroundColor: t.surface }]}>
          <SukiBunny mood="cheer" size={96} />
          <Text style={[styles.streakValue, { color: t.text }]}>{streakDays}</Text>
          <Text style={[styles.streakLabel, { color: t.muted }]}>
            days logged in a row{todayLoggedButNotCredited ? ' · +1 tonight' : ''}
          </Text>
          {streakDays === 0 && todayLoggedButNotCredited && (
            <Text style={[styles.streakHint, { color: t.faint }]}>Today counts once it rolls over at midnight.</Text>
          )}

          <View style={styles.weekRow}>
            {week.map((d, i) => {
              const bg = d.status === 'good' ? t.sageBg : d.status === 'over' ? t.accentBg : 'transparent';
              const bd = d.status === 'good' ? t.sage : d.status === 'over' ? t.accent : t.line;
              return (
                <View key={i} style={styles.weekDay}>
                  <View style={[styles.weekDot, { backgroundColor: bg, borderColor: bd }]}>
                    {d.status === 'good' && <Check size={13} color={t.sageInk2} strokeWidth={iconStrokeWidth} />}
                    {d.status === 'over' && <RefreshCw size={13} color={t.accentInk} strokeWidth={iconStrokeWidth} />}
                  </View>
                  <Text style={[styles.weekLabel, { color: t.faint }]}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.sageBg }]}>
          <Text style={[styles.infoText, { color: t.sageInk }]}>
            Over-limit days keep your streak. Only a day with <Text style={{ fontFamily: fonts.bodyBold }}>nothing logged</Text> resets it —
            the ring above shows both, so an amber day is still a day you showed up.
          </Text>
        </View>

        <Text style={[styles.badgesTitle, { color: t.text }]}>Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGE_DEFINITIONS.map((b) => {
            const unlocked = unlockedIds.has(b.id);
            const Icon = unlocked ? BADGE_ICONS[b.icon] : Lock;
            return (
              <View
                key={b.id}
                style={[
                  styles.badge,
                  { backgroundColor: unlocked ? t.sageBg : t.surface, borderColor: unlocked ? t.sage : t.line, opacity: unlocked ? 1 : 0.6 },
                ]}
              >
                <View style={[styles.badgeIconWrap, { backgroundColor: unlocked ? 'rgba(255,255,255,.5)' : t.track }]}>
                  <Icon size={22} color={unlocked ? t.sageInk2 : t.faint} strokeWidth={iconStrokeWidth} />
                </View>
                <Text style={[styles.badgeName, { color: t.text }]}>{b.name}</Text>
                <Text style={[styles.badgeSub, { color: t.muted }]}>{b.sub}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: space[6],
    paddingBottom: space[6],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  streakCard: {
    borderRadius: radii.card,
    paddingVertical: 24,
    alignItems: 'center',
  },
  streakValue: {
    fontFamily: fonts.heading,
    fontSize: 64,
    lineHeight: 66,
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  streakHint: {
    fontSize: 11.5,
    marginTop: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  weekDay: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    fontSize: 10.5,
  },
  infoCard: {
    borderRadius: radii.lg,
    padding: 17,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19.5,
  },
  badgesTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    width: '31%',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: radii.lg - 2,
    borderWidth: 1.5,
  },
  badgeIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontFamily: fonts.heading,
    fontSize: 12.5,
    textAlign: 'center',
  },
  badgeSub: {
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 13,
  },
});
