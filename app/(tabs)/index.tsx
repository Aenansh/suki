import { router } from 'expo-router';
import { Moon, Settings as SettingsIcon, Sun } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { EntryRow } from '@/components/home/EntryRow';
import { QuickTiles } from '@/components/home/QuickTiles';
import { StatusBanner } from '@/components/home/StatusBanner';
import { SugarRing } from '@/components/home/SugarRing';
import { Button } from '@/components/ui';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLogStore } from '@/stores/logStore';
import { useStreakStore } from '@/stores/streakStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUserStore } from '@/stores/userStore';

export default function Home() {
  const t = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggle);

  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const sukiPoints = useUserStore((s) => s.sukiPoints);

  const todayEntries = useLogStore((s) => s.todayEntries);
  const todayTotal = useLogStore((s) => s.todayTotal);
  const isOverLimit = useLogStore((s) => s.isOverLimit);
  const recoveryModalShown = useLogStore((s) => s.recoveryModalShown);
  const loadToday = useLogStore((s) => s.loadToday);

  const streakDays = useStreakStore((s) => s.currentStreak);
  const loadStreak = useStreakStore((s) => s.loadStreak);

  useEffect(() => {
    loadToday();
    loadStreak();
  }, [loadToday, loadStreak]);

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  const hour = new Date().getHours();
  const greeting = streakDays === 0 ? 'Welcome' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const showRecoveryCard = isOverLimit && !recoveryModalShown;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.dateLabel, { color: t.faint }]}>{dateLabel.toUpperCase()}</Text>
            <Text style={[styles.greeting, { color: t.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {greeting}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle theme"
              onPress={toggleTheme}
              style={[styles.iconButton, { borderColor: t.line }]}
            >
              {t.scheme === 'dark' ? (
                <Sun size={18} color={t.muted} strokeWidth={iconStrokeWidth} />
              ) : (
                <Moon size={18} color={t.muted} strokeWidth={iconStrokeWidth} />
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
              style={[styles.iconButton, { borderColor: t.line }]}
            >
              <SettingsIcon size={18} color={t.muted} strokeWidth={iconStrokeWidth} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Suki Points"
              onPress={() => router.push('/(tabs)/points')}
              style={[styles.pointsPill, { backgroundColor: t.goldBg }]}
            >
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={t.goldInk} strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 7.5v9M9.5 10.2h5M9.5 13.8h5" />
                <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </Svg>
              <Text style={[styles.pointsValue, { color: t.goldInk }]}>{Math.round(sukiPoints)}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.ringCard, { backgroundColor: t.surface }]}>
          <SugarRing sugar={todayTotal} limit={dailyLimitG} />
          <StatusBanner sugar={todayTotal} limit={dailyLimitG} />
        </View>

        {showRecoveryCard && (
          <View style={[styles.recoveryCard, { backgroundColor: t.accentBg }]}>
            <View style={styles.recoveryRow}>
              <View style={styles.recoveryMascot}>
                <SukiBunny mood="warm" size={52} />
              </View>
              <View style={styles.recoveryText}>
                <Text style={[styles.recoveryTitle, { color: t.accentInk }]}>Today ran long. Recovery mode.</Text>
                <Text style={[styles.recoveryBody, { color: t.accentInk }]}>
                  Your streak is safe — you logged. Pick one thing and today still counts for something.
                </Text>
              </View>
            </View>
            <Button label="See my 3 options" onPress={() => router.push('/recovery')} fullWidth />
          </View>
        )}

        <Pressable onPress={() => router.push('/sos')} style={[styles.sosCard, { borderColor: t.sage, backgroundColor: t.sageBg }]}>
          <View style={[styles.sosIconWrap, { backgroundColor: t.sage }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 20.5s-7.5-4.8-7.5-10a4.5 4.5 0 018.1-2.7A4.5 4.5 0 0119.5 10.5c0 5.2-7.5 10-7.5 10z" />
            </Svg>
          </View>
          <View style={styles.sosText}>
            <Text style={[styles.sosTitle, { color: t.sageInk }]}>Craving hitting?</Text>
            <Text style={[styles.sosSub, { color: t.sageInk }]}>Tap SOS — we&apos;ll ride it out together</Text>
          </View>
        </Pressable>

        <QuickTiles streakDays={streakDays} points={sukiPoints} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Today</Text>
          <Text style={[styles.sectionCount, { color: t.faint }]}>
            {todayEntries.length} {todayEntries.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {todayEntries.some((e) => e.source === 'redeemed') && (
          <Text style={[styles.redeemedNote, { color: t.faint }]}>
            Redeemed treats don&apos;t count toward the ring above — they&apos;re already paid for in points.
          </Text>
        )}

        {todayEntries.length > 0 ? (
          <View style={styles.entryList}>
            {todayEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                // Redeemed treats are already spent — editing them would let someone rewrite a
                // purchase after the fact. See app/log.tsx's 'locked' step for the full message.
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
            <SukiBunny mood="happy" size={78} />
            <Text style={[styles.emptyTitle, { color: t.text }]}>Nothing logged yet</Text>
            <Text style={[styles.emptyBody, { color: t.muted }]}>
              Coffee counts. Ketchup counts. Log the first thing and your streak starts today.
            </Text>
          </View>
        )}

        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* Always visible, even over limit — logging is never blocked (UX rule #1). */}
      <View style={[styles.logButtonWrap, { backgroundColor: t.bg }]}>
        <Button label="+ Log sugar" onPress={() => router.push('/log')} fullWidth style={styles.logButton} />
      </View>
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  dateLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1,
  },
  greeting: {
    fontFamily: fonts.heading,
    fontSize: 26,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 16,
  },
  pointsValue: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  ringCard: {
    borderRadius: radii.card,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 18,
    marginBottom: 12,
  },
  recoveryCard: {
    borderRadius: radii.card - 4,
    padding: 18,
    paddingBottom: 16,
    marginBottom: 12,
    gap: 12,
  },
  recoveryRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  recoveryMascot: {
    width: 52,
  },
  recoveryText: {
    flex: 1,
  },
  recoveryTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  recoveryBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 5,
    opacity: 0.85,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 14,
  },
  sosIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    flex: 1,
  },
  sosTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  sosSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    marginTop: 1,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
  },
  sectionCount: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  redeemedNote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: -4,
    marginBottom: 10,
  },
  entryList: {
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    marginTop: 6,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19.5,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollSpacer: {
    height: 8,
  },
  logButtonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space[6],
    paddingTop: 14,
    paddingBottom: 30,
    opacity: 0.5,
  },
  logButton: {
    shadowColor: '#2e2b25',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6,
  },
});
