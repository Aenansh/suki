import { router } from 'expo-router';
import { Footprints, Leaf, RefreshCw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SukiBunny } from '@/components/mascot/SukiBunny';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLogStore } from '@/stores/logStore';
import { useUserStore } from '@/stores/userStore';
import type { RecoveryOption } from '@/db/types';

const OPTIONS: {
  option: RecoveryOption;
  title: string;
  sub: string;
  pts: number;
  ptsLabel: string;
  Icon: typeof Footprints;
  filled: boolean;
}[] = [
  { option: 'activity', title: 'Walk it off', sub: '15 minutes, any pace', pts: 15, ptsLabel: '+15 pts', Icon: Footprints, filled: true },
  { option: 'tighter_tomorrow', title: 'Bank tomorrow', sub: 'Trim 5g off tomorrow instead', pts: 10, ptsLabel: '+10 pts', Icon: RefreshCw, filled: true },
  { option: 'reset', title: 'Just close the day', sub: 'Nothing owed. Log again tomorrow.', pts: 0, ptsLabel: '+0', Icon: Leaf, filled: false },
];

export default function Recovery() {
  const t = useAppTheme();
  const todayTotal = useLogStore((s) => s.todayTotal);
  const dailyLimitG = useUserStore((s) => s.dailyLimitG);
  const addPoints = useUserStore((s) => s.addPoints);
  const setRecoveryOption = useLogStore((s) => s.setRecoveryOption);
  const markRecoveryShown = useLogStore((s) => s.markRecoveryShown);

  const overBy = Math.max(0, Math.round(todayTotal - dailyLimitG));

  async function choose(option: RecoveryOption, pts: number) {
    await setRecoveryOption(option);
    await markRecoveryShown();
    if (pts > 0) await addPoints(pts);
    router.back();
  }

  async function closeWithoutChoosing() {
    await markRecoveryShown();
    router.back();
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['bottom']}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.mascotWrap}>
            <SukiBunny mood="warm" size={66} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: t.text }]}>{overBy}g over today.</Text>
            <Text style={[styles.subtitle, { color: t.muted }]}>
              That&apos;s information, not a failure. Your streak holds because you logged it. Pick one small thing:
            </Text>
          </View>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.option}
              onPress={() => choose(o.option, o.pts)}
              style={[
                styles.option,
                {
                  borderColor: o.filled ? 'transparent' : t.line,
                  backgroundColor: o.filled ? t.sageBg : 'transparent',
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: o.filled ? 'rgba(255,255,255,.5)' : t.surface }]}>
                <o.Icon size={19} color={o.filled ? t.sageInk2 : t.faint} strokeWidth={iconStrokeWidth} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: t.text }]}>{o.title}</Text>
                <Text style={[styles.optionSub, { color: t.muted }]}>{o.sub}</Text>
              </View>
              <Text style={[styles.optionPts, { color: t.sageInk2 }]}>{o.ptsLabel}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={closeWithoutChoosing} style={styles.closeLink}>
          <Text style={{ color: t.faint, fontSize: 14 }}>Not today — just close</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 10,
  },
  content: {
    padding: space[6],
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mascotWrap: {
    width: 66,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 23,
    lineHeight: 27,
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  options: {
    gap: 9,
    marginBottom: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1.5,
    borderRadius: radii.lg - 2,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  optionSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    marginTop: 2,
  },
  optionPts: {
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  closeLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
