import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryRow } from '@/components/home/EntryRow';
import { SugarRing } from '@/components/home/SugarRing';
import { SukiBunny } from '@/components/mascot/SukiBunny';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { getDayLog } from '@/db/queries/dayLog';
import { getEntriesForDate } from '@/db/queries/entries';
import type { Entry } from '@/db/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/userStore';
import { addDays, getTodayDateString } from '@/utils/date';
import { budgetRelevantEntries, sumSugarG } from '@/utils/sugarBudget';

/** A single past (or today's) day's log — reached by tapping a History calendar cell or Home's
 * prev-day arrow. Entries here reuse the same 48h edit window as Home's list (app/log.tsx
 * resolves the entry straight from the DB, not a today-scoped store), so nothing new had to be
 * built for editing — just a new place to launch it from. */
export default function DayDetail() {
  const t = useAppTheme();
  const { date } = useLocalSearchParams<{ date: string }>();
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [pointsLocked, setPointsLocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!date) return;
    const [dayEntries, dayLog] = await Promise.all([getEntriesForDate(date), getDayLog(date)]);
    setEntries(dayEntries);
    setPointsLocked(dayLog?.pointsLocked ?? false);
    setLoaded(true);
  }, [date]);

  // Refetch on focus, not just mount — coming back from editing/deleting an entry should show
  // the change immediately.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!date) return null;

  const today = getTodayDateString();
  const isToday = date === today;
  const canGoNext = date < today;

  const relevant = budgetRelevantEntries(entries);
  const total = sumSugarG(relevant);
  const over = total > dailyLimitG;
  const hasRedeemed = entries.some((e) => e.source === 'redeemed');

  const dateObj = new Date(`${date}T00:00:00`);
  const dateLabel = dateObj.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const statusInk = entries.length === 0 ? t.muted : over ? t.accentInk : t.sageInk;
  const statusText =
    entries.length === 0 ? 'Nothing logged this day' : over ? `${Math.round(total - dailyLimitG)}g over budget that day` : 'Under budget that day';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { borderColor: t.line }]}
        >
          <ArrowLeft size={17} color={t.text} strokeWidth={iconStrokeWidth} />
        </Pressable>

        <View style={styles.dateNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            onPress={() => router.setParams({ date: addDays(date, -1) })}
            style={styles.dateNavBtn}
          >
            <ChevronLeft size={16} color={t.faint} strokeWidth={2.5} />
          </Pressable>
          <Text style={[styles.dateLabel, { color: t.text }]} numberOfLines={1}>
            {isToday ? 'Today' : dateLabel}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next day"
            onPress={() => canGoNext && router.setParams({ date: addDays(date, 1) })}
            disabled={!canGoNext}
            style={[styles.dateNavBtn, !canGoNext && styles.dateNavBtnDisabled]}
          >
            <ChevronRight size={16} color={t.faint} strokeWidth={2.5} />
          </Pressable>
        </View>

        <View style={styles.iconBtn}  />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isToday && <Text style={[styles.subLabel, { color: t.faint }]}>{dateLabel}</Text>}

        <View style={[styles.ringCard, { backgroundColor: t.surface }]}>
          <SugarRing sugar={total} limit={dailyLimitG} label={isToday ? 'today' : 'that day'} />
          <Text style={[styles.summaryText, { color: statusInk }]}>{statusText}</Text>
        </View>

        {pointsLocked && (
          <Text style={[styles.lockedNote, { color: t.faint }]}>
            Points for this day are already locked in — edits here keep the record accurate but won&apos;t change what
            you earned.
          </Text>
        )}

        {hasRedeemed && (
          <Text style={[styles.lockedNote, { color: t.faint }]}>
            Redeemed treats don&apos;t count toward that day&apos;s total — they were already paid for in points.
          </Text>
        )}

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: t.text }]}>Entries</Text>
          <Text style={[styles.listCount, { color: t.faint }]}>
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {!loaded ? null : entries.length > 0 ? (
          <View style={styles.entryList}>
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onPress={
                  entry.source === 'redeemed'
                    ? undefined
                    : () => router.push({ pathname: '/log', params: { editId: entry.id } })
                }
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: t.surface }]}>
            <SukiBunny mood="calm" size={70} />
            <Text style={[styles.emptyTitle, { color: t.text }]}>Nothing logged this day</Text>
          </View>
        )}

        <View style={styles.scrollSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: space[6],
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateNavBtn: {
    padding: 10,
  },
  dateNavBtnDisabled: {
    opacity: 0.3,
  },
  dateLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: space[6],
    paddingTop: 8,
    paddingBottom: 40,
  },
  subLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  ringCard: {
    borderRadius: radii.card,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 18,
    marginBottom: 12,
  },
  summaryText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 14,
  },
  lockedNote: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 10,
  },
  listTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  listCount: {
    fontSize: 12,
  },
  entryList: {
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 22,
    borderRadius: radii.lg,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  scrollSpacer: {
    height: 8,
  },
});
