import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Lock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { Button, Stepper, TextField } from '@/components/ui';
import { GOALS, getGoalLabel, type GoalId } from '@/constants/goals';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { clearTodayEntries, resetAllProgress } from '@/db/queries/reset';
import { useAppTheme } from '@/hooks/useAppTheme';
import { clearApiKey, getApiKey, maskApiKey, setApiKey, validateApiKey } from '@/services/apiKey';
import { useFrequentPicksStore } from '@/stores/frequentPicksStore';
import { useLogStore } from '@/stores/logStore';
import { useStreakStore } from '@/stores/streakStore';
import { useUserStore } from '@/stores/userStore';
import { getTodayDateString } from '@/utils/date';

const REMINDER_TIMES = ['12:00 PM', '6:00 PM', '9:00 PM'];

export default function Settings() {
  const t = useAppTheme();
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const goal = useUserStore((s) => s.goal);
  const setLimit = useUserStore((s) => s.setLimit);
  const setGoal = useUserStore((s) => s.setGoal);
  const loadUser = useUserStore((s) => s.loadUser);
  const loadToday = useLogStore((s) => s.loadToday);
  const loadStreak = useStreakStore((s) => s.loadStreak);
  const loadPicks = useFrequentPicksStore((s) => s.loadPicks);

  const [editingLimit, setEditingLimit] = useState(false);
  const [limitDraft, setLimitDraft] = useState(Math.round(dailyLimitG));
  const [editingGoal, setEditingGoal] = useState(false);

  const [reminderOn, setReminderOn] = useState(false);
  const [reminderAt, setReminderAt] = useState('9:00 PM');

  const [maskedKey, setMaskedKey] = useState('No key set');
  const [hasKey, setHasKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [keyWarning, setKeyWarning] = useState('');
  const [checkingKey, setCheckingKey] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => {
      setHasKey(!!k);
      setMaskedKey(k ? maskApiKey(k) : 'No key set');
    });
  }, []);

  async function saveLimit() {
    await setLimit(limitDraft);
    setEditingLimit(false);
  }

  async function pickGoal(id: GoalId) {
    await setGoal(id);
    setEditingGoal(false);
  }

  async function saveKey() {
    const trimmed = keyDraft.trim();
    if (!trimmed) {
      setKeyWarning('Paste a key first — or remove the old one.');
      return;
    }
    setKeyWarning('');
    setCheckingKey(true);
    // Never blocks on the result — offline or a flaky check still lets the key save (manual
    // grams entry is always the fallback), it just surfaces what Suki found.
    const result = await validateApiKey(trimmed);
    setCheckingKey(false);
    if (!result.valid) setKeyWarning(`${result.reason} — saved anyway, you can update it any time.`);

    await setApiKey(trimmed);
    setHasKey(true);
    setMaskedKey(maskApiKey(trimmed));
    setKeyDraft('');
    setEditingKey(false);
  }

  async function removeKey() {
    await clearApiKey();
    setHasKey(false);
    setMaskedKey('No key set');
    setKeyDraft('');
    setKeyWarning('');
    setEditingKey(false);
  }

  function confirmClearToday() {
    Alert.alert("Clear today's entries?", 'This removes everything logged today. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear today',
        style: 'destructive',
        onPress: async () => {
          await clearTodayEntries(getTodayDateString());
          await loadToday();
        },
      },
    ]);
  }

  function confirmClearAll() {
    Alert.alert(
      'Clear all data?',
      'This resets every logged entry, your points, and your streak. Your limit, goal, and API key stay put.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllProgress();
            await Promise.all([loadUser(), loadToday(), loadStreak(), loadPicks()]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={[styles.backBtn, { borderColor: t.line }]}
          >
            <ArrowLeft size={17} color={t.text} strokeWidth={iconStrokeWidth} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: t.text }]}>Settings</Text>
          <SukiBunny mood="happy" size={44} />
        </View>

        <Text style={[styles.kicker, { color: t.faint }]}>GENERAL</Text>
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Pressable onPress={() => setEditingLimit((v) => !v)} style={styles.row}>
            <Text style={[styles.rowLabel, { color: t.text }]}>Daily sugar limit</Text>
            <Text style={[styles.rowValue, { color: t.muted }]}>{Math.round(dailyLimitG)}g</Text>
            <ChevronRight size={14} color={t.faint} strokeWidth={2} />
          </Pressable>
          {editingLimit && (
            <View style={styles.editPanel}>
              <Stepper value={limitDraft} onChange={setLimitDraft} min={5} max={100} size="lg" />
              <Button label="Save" onPress={saveLimit} style={styles.editSaveBtn} />
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: t.line }]} />

          <Pressable onPress={() => setEditingGoal((v) => !v)} style={styles.row}>
            <Text style={[styles.rowLabel, { color: t.text }]}>Goal</Text>
            <Text style={[styles.rowValue, { color: t.muted }]}>{getGoalLabel(goal)}</Text>
            <ChevronRight size={14} color={t.faint} strokeWidth={2} />
          </Pressable>
          {editingGoal && (
            <View style={styles.editPanel}>
              {GOALS.map((g) => (
                <Pressable key={g.id} onPress={() => pickGoal(g.id)} style={styles.goalOption}>
                  <Text style={[styles.goalOptionText, { color: goal === g.id ? t.accentInk : t.text }]}>{g.title}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: t.line }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: t.text }]}>Daily reminder</Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: reminderOn }}
              onPress={() => setReminderOn((v) => !v)}
              style={[styles.toggle, { backgroundColor: reminderOn ? t.sage : t.track }]}
            >
              <View style={[styles.toggleKnob, { left: reminderOn ? 24 : 3 }]} />
            </Pressable>
          </View>
          {reminderOn && (
            <View style={styles.reminderRow}>
              <Text style={{ flex: 1, fontSize: 13.5, color: t.muted }}>Nudge me at</Text>
              <View style={styles.reminderChips}>
                {REMINDER_TIMES.map((time) => {
                  const on = reminderAt === time;
                  return (
                    <Pressable
                      key={time}
                      onPress={() => setReminderAt(time)}
                      style={[styles.reminderChip, { borderColor: on ? t.sage : t.line, backgroundColor: on ? t.sageBg : 'transparent' }]}
                    >
                      <Text style={{ color: t.text, fontSize: 13 }}>{time}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <Text style={[styles.kicker, { color: t.faint }]}>AI & API</Text>
        <View style={[styles.aiCard, { backgroundColor: t.sageBg }]}>
          <View style={styles.aiRow}>
            <View style={styles.aiIconWrap}>
              <Lock size={19} color={t.sageInk} strokeWidth={iconStrokeWidth} />
            </View>
            <View style={styles.aiText}>
              <Text style={{ fontSize: 12, color: t.sageInk, opacity: 0.75 }}>Gemini key</Text>
              <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: t.sageInk }}>{maskedKey}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: hasKey ? 'rgba(255,255,255,.6)' : t.accentBg }]}>
              <Text style={{ fontSize: 11, color: hasKey ? t.sageInk : t.accentInk }}>{hasKey ? 'Active' : 'Missing'}</Text>
            </View>
          </View>

          {editingKey ? (
            <View style={styles.editPanel}>
              <TextField value={keyDraft} onChangeText={setKeyDraft} placeholder="AIza…" autoCapitalize="none" autoCorrect={false} secureTextEntry />
              {!!keyWarning && <Text style={{ color: t.accentInk, fontSize: 12, marginTop: 8 }}>{keyWarning}</Text>}
              <Button label="Save key" onPress={saveKey} loading={checkingKey} fullWidth style={styles.editSaveBtn} />
              {hasKey && (
                <Pressable onPress={removeKey} style={styles.removeKeyLink}>
                  <Text style={{ color: t.sageInk, fontSize: 13, textDecorationLine: 'underline' }}>Remove key and log manually</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Button label="Update API key" onPress={() => setEditingKey(true)} fullWidth style={styles.updateKeyBtn} />
          )}

          <Text style={[styles.aiFootnote, { color: t.sageInk }]}>
            Smart logging, photo logging and open redeem all run on this key. It stays on your phone — Suki never
            uploads it. Google&apos;s free tier covers normal daily use.
          </Text>
          <Pressable onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}>
            <Text style={{ fontSize: 13, color: t.sageInk, textDecorationLine: 'underline', marginTop: 8 }}>What is this?</Text>
          </Pressable>
        </View>

        <Text style={[styles.kicker, { color: t.faint }]}>DATA</Text>
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Pressable onPress={confirmClearToday} style={styles.plainRow}>
            <Text style={{ color: t.text, fontSize: 14.5 }}>Clear today&apos;s entries</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: t.line }]} />
          <Pressable onPress={confirmClearAll} style={styles.plainRow}>
            <Text style={{ color: t.accentInk, fontSize: 14.5 }}>Clear all data…</Text>
          </Pressable>
        </View>

        <Text style={[styles.kicker, { color: t.faint }]}>ABOUT</Text>
        <View style={[styles.card, styles.aboutCard, { backgroundColor: t.surface }]}>
          <View style={styles.aboutRow}>
            <Text style={{ color: t.muted, fontSize: 13.5 }}>Version</Text>
            <Text style={{ color: t.muted, fontSize: 13.5 }}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={{ color: t.muted, fontSize: 13.5 }}>Open source</Text>
            <Pressable onPress={() => Linking.openURL('https://github.com/navoren/suki')}>
              <Text style={{ color: t.accentInk, fontSize: 13.5 }}>github.com/navoren/suki</Text>
            </Pressable>
          </View>
          <View style={styles.aboutRow}>
            <Text style={{ color: t.muted, fontSize: 13.5 }}>Built by</Text>
            <Text style={{ color: t.muted, fontSize: 13.5 }}>Naman Tomar</Text>
          </View>
        </View>

        <View style={styles.scrollSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: space[6], paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  backBtn: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.heading, fontSize: 27 },
  kicker: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginHorizontal: 4, marginBottom: 8 },
  card: { borderRadius: radii.lg - 2, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18 },
  rowLabel: { flex: 1, fontSize: 14.5 },
  rowValue: { fontFamily: fonts.heading, fontSize: 15 },
  divider: { height: 1, marginLeft: 18 },
  editPanel: { paddingHorizontal: 18, paddingBottom: 16, paddingTop: 4, alignItems: 'center', gap: 12 },
  editSaveBtn: { marginTop: 4 },
  removeKeyLink: { paddingVertical: 6 },
  goalOption: { paddingVertical: 10, width: '100%' },
  goalOptionText: { fontFamily: fonts.body, fontSize: 14.5 },
  toggle: { width: 52, height: 31, borderRadius: 999, position: 'relative' },
  toggleKnob: { position: 'absolute', top: 3, width: 25, height: 25, borderRadius: 999, backgroundColor: '#fff' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 16 },
  reminderChips: { flexDirection: 'row', gap: 6 },
  reminderChip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13 },
  aiCard: { borderRadius: radii.lg, padding: 18, marginBottom: 20 },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aiIconWrap: { width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.5)', alignItems: 'center', justifyContent: 'center' },
  aiText: { flex: 1 },
  statusPill: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  updateKeyBtn: {},
  aiFootnote: { fontSize: 12.5, lineHeight: 18, opacity: 0.85, marginTop: 12 },
  aboutCard: { padding: 18, gap: 10 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  plainRow: { paddingVertical: 16, paddingHorizontal: 18 },
  scrollSpacer: { height: 8 },
});
