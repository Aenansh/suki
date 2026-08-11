import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, radii, space } from '@/constants/theme';
import { getEntriesBetween } from '@/db/queries/entries';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStreakStore } from '@/stores/streakStore';
import { useUserStore } from '@/stores/userStore';
import { addDays, getTodayDateString, toDateString } from '@/utils/date';
import { budgetRelevantEntries } from '@/utils/sugarBudget';

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type CellStatus = 'under' | 'over' | 'missed' | 'future' | 'blank';

function openDay(date: string) {
  router.push({ pathname: '/day/[date]', params: { date } });
}

export default function History() {
  const t = useAppTheme();
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const streakDays = useStreakStore((s) => s.currentStreak);

  const [calendar, setCalendar] = useState<{ n: number | ''; date: string; status: CellStatus }[]>([]);
  const [summary, setSummary] = useState('');
  const [bars, setBars] = useState<{ date: string; label: string; grams: number; over: boolean; heightPct: number }[]>([]);

  useEffect(() => {
    (async () => {
      const today = getTodayDateString();
      const now = new Date(`${today}T00:00:00`);
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstOfMonth = toDateString(new Date(year, month, 1));

      const entries = await getEntriesBetween(firstOfMonth, today);
      const totalsByDate = new Map<string, number>();
      for (const e of budgetRelevantEntries(entries)) totalsByDate.set(e.date, (totalsByDate.get(e.date) ?? 0) + e.sugarG);

      // Leading blanks so day 1 lands under the correct weekday (Monday-first grid).
      const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
      const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;
      const cells: { n: number | ''; date: string; status: CellStatus }[] = Array.from({ length: leadingBlanks }, () => ({
        n: '',
        date: '',
        status: 'blank',
      }));

      let daysTracked = 0;
      let daysUnder = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = toDateString(new Date(year, month, d));
        if (date > today) {
          cells.push({ n: d, date, status: 'future' });
          continue;
        }
        const total = totalsByDate.get(date);
        if (total === undefined) {
          cells.push({ n: d, date, status: 'missed' });
        } else {
          daysTracked += 1;
          const under = total <= dailyLimitG;
          if (under) daysUnder += 1;
          cells.push({ n: d, date, status: under ? 'under' : 'over' });
        }
      }
      setCalendar(cells);

      const monthName = now.toLocaleDateString(undefined, { month: 'long' });
      const streakClause = streakDays > 0 ? ' · streak intact' : '';
      setSummary(`${monthName} · ${daysTracked} day${daysTracked === 1 ? '' : 's'} tracked · ${daysUnder} under budget${streakClause}`);

      // Last 7 days bar chart.
      const weekEntries = await getEntriesBetween(addDays(today, -6), today);
      const weekTotals = new Map<string, number>();
      for (const e of budgetRelevantEntries(weekEntries)) weekTotals.set(e.date, (weekTotals.get(e.date) ?? 0) + e.sugarG);
      const scaleMax = Math.max(dailyLimitG * 1.5, ...Array.from(weekTotals.values()), 1);
      const barList = [];
      for (let i = 6; i >= 0; i--) {
        const date = addDays(today, -i);
        const grams = Math.round(weekTotals.get(date) ?? 0);
        barList.push({
          date,
          label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' }),
          grams,
          over: grams > dailyLimitG,
          heightPct: Math.max(4, Math.round((grams / scaleMax) * 100)),
        });
      }
      setBars(barList);
    })();
  }, [dailyLimitG, streakDays]);

  const budgetLinePct = Math.min(100, Math.round((dailyLimitG / Math.max(dailyLimitG * 1.5, 1)) * 100));

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: t.text }]}>{new Date().toLocaleDateString(undefined, { month: 'long' })}</Text>
        <Text style={[styles.summary, { color: t.muted }]}>{summary}</Text>
        <Text style={[styles.disclaimer, { color: t.faint }]}>
          Tap any logged day below to view or edit what you had — entries stay editable for 48 hours.
        </Text>

        <View style={[styles.calendarCard, { backgroundColor: t.surface }]}>
          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((d, i) => (
              <Text key={i} style={[styles.dayName, { color: t.faint }]}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {calendar.map((c, i) => {
              const bg = c.status === 'under' ? t.sageBg : c.status === 'over' ? t.accentBg : 'transparent';
              const bd = c.status === 'under' ? t.sage : c.status === 'over' ? t.accent : t.line;
              const ink = c.status === 'future' || c.status === 'blank' ? t.faint : t.text;
              const tappable = c.status !== 'blank' && c.status !== 'future';
              return (
                <Pressable
                  key={i}
                  disabled={!tappable}
                  onPress={() => tappable && openDay(c.date)}
                  style={[styles.cell, { backgroundColor: bg, borderColor: c.status === 'blank' ? 'transparent' : bd }]}
                >
                  <Text style={{ color: ink, fontSize: 11.5 }}>{c.n}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.legend, { borderTopColor: t.line }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: t.sageBg, borderColor: t.sage }]} />
              <Text style={[styles.legendLabel, { color: t.muted }]}>Under budget</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: t.accentBg, borderColor: t.accent }]} />
              <Text style={[styles.legendLabel, { color: t.muted }]}>Over, logged</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'transparent', borderColor: t.line }]} />
              <Text style={[styles.legendLabel, { color: t.muted }]}>Not logged</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: t.text }]}>Last 7 days</Text>
        <View style={[styles.barsCard, { backgroundColor: t.surface }]}>
          <View style={styles.barsArea}>
            <View style={[styles.budgetLine, { bottom: `${budgetLinePct}%`, borderColor: t.accent }]} />
            {bars.map((b, i) => (
              <Pressable key={i} onPress={() => openDay(b.date)} style={styles.barCol}>
                <Text style={[styles.barValue, { color: t.muted }]}>{b.grams}g</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${b.heightPct}%`, backgroundColor: b.over ? t.accent : t.sage },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: t.faint }]}>{b.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.barsFooter, { color: t.muted }]}>Dashed line at your {Math.round(dailyLimitG)}g budget</Text>
        </View>

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
  title: {
    fontFamily: fonts.heading,
    fontSize: 27,
    marginBottom: 2,
  },
  summary: {
    fontSize: 13,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 16,
  },
  calendarCard: {
    borderRadius: radii.card - 4,
    padding: 18,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  legendLabel: {
    fontSize: 11.5,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
    marginTop: 22,
    marginBottom: 12,
  },
  barsCard: {
    borderRadius: radii.card - 4,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  barsArea: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    height: 150,
  },
  budgetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.75,
    zIndex: 1,
  },
  barCol: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  barValue: {
    fontSize: 10.5,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
  },
  barLabel: {
    fontSize: 10.5,
  },
  barsFooter: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  scrollSpacer: {
    height: 8,
  },
});
