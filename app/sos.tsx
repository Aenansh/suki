import { router } from 'expo-router';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreathingRing } from '@/components/home/BreathingRings';
import { SukiBunny, type SukiMood } from '@/components/mascot/SukiBunny';
import { Button, TextField } from '@/components/ui';
import { fonts, iconStrokeWidth, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { suggestSwap } from '@/services/gemini';
import { checkAndUnlockBadges } from '@/utils/badgeChecker';
import { incrementSosResistCount } from '@/utils/sosCounter';

const SOS_TEXT = '#f2f6e8';
const TIMER_SECONDS = 10 * 60;
const RING_R = 82;
const RING_C = 2 * Math.PI * RING_R;

type Mode = 'menu' | 'swap' | 'timer';
type SwapStep = 'ask' | 'busy' | 'result';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Sos() {
  const t = useAppTheme();
  const [mode, setMode] = useState<Mode>('menu');

  // Swap flow state.
  const [swapStep, setSwapStep] = useState<SwapStep>('ask');
  const [craving, setCraving] = useState('');
  const [suggestion, setSuggestion] = useState('');

  // Timer flow state.
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerDone, setTimerDone] = useState(false);
  const markedWinRef = useRef(false);

  useEffect(() => {
    if (mode !== 'timer' || !timerRunning || timerDone) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerDone(true);
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, timerRunning, timerDone]);

  // A completed 10-minute wait counts toward the "Rode It Out" badge (utils/badgeChecker.ts) —
  // no Suki Points are ever awarded here, only the badge milestone, so there's no point exploit.
  useEffect(() => {
    if (timerDone && !markedWinRef.current) {
      markedWinRef.current = true;
      incrementSosResistCount().then(() => checkAndUnlockBadges());
    }
  }, [timerDone]);

  function openSwap() {
    setMode('swap');
    setSwapStep('ask');
    setCraving('');
    setSuggestion('');
  }

  function openTimer() {
    setSecondsLeft(TIMER_SECONDS);
    setTimerRunning(true);
    setTimerDone(false);
    markedWinRef.current = false;
    setMode('timer');
  }

  function backToMenu() {
    setMode('menu');
  }

  async function runSwap(cravingText: string) {
    setCraving(cravingText);
    setSwapStep('busy');
    const result = await suggestSwap(cravingText);
    setSuggestion(result);
    setSwapStep('result');
  }

  function gaveIn() {
    router.replace('/log');
  }

  const timerProgress = 1 - secondsLeft / TIMER_SECONDS;
  const mascotMood: SukiMood = timerDone ? 'cheer' : 'calm';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.sosBg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'menu' ? 'Close' : 'Back'}
          onPress={mode === 'menu' ? () => router.back() : backToMenu}
          style={styles.backBtn}
        >
          <ArrowLeft size={17} color={SOS_TEXT} strokeWidth={iconStrokeWidth} />
        </Pressable>
        <Text style={styles.headerLabel}>CRAVING MODE</Text>
        <View style={styles.backBtn} />
      </View>

      {mode === 'menu' && (
        <>
          <View style={styles.hero}>
            <View style={styles.breatheWrap}>
              <BreathingRing color="rgba(174,191,146,.32)" delay={0} />
              <BreathingRing color="rgba(174,191,146,.28)" delay={600} />
              <View style={styles.mascot}>
                <SukiBunny mood="calm" size={96} />
              </View>
            </View>
            <Text style={styles.title}>Cravings peak at 10 minutes.</Text>
            <Text style={styles.subtitle}>Breathe with the circle. Then pick one — any one is a win.</Text>
          </View>

          <View style={styles.cards}>
            <Pressable onPress={openSwap} style={styles.card}>
              <View style={styles.cardIcon}>
                <RefreshCw size={19} color={SOS_TEXT} strokeWidth={iconStrokeWidth} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Swap it</Text>
                <Text style={styles.cardSub}>Trade it for something lighter, picked for you</Text>
              </View>
            </Pressable>
            <Pressable onPress={openTimer} style={styles.card}>
              <View style={styles.cardIcon}>
                <Clock size={19} color={SOS_TEXT} strokeWidth={iconStrokeWidth} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Wait ten</Text>
                <Text style={styles.cardSub}>A guided 10-minute timer to ride it out</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => router.back()} style={styles.resistBtn}>
              <Text style={styles.resistLabel}>I&apos;m okay now</Text>
            </Pressable>
            <Pressable onPress={gaveIn} style={styles.gaveInBtn}>
              <Text style={styles.gaveInLabel}>I gave in — let&apos;s just log it</Text>
            </Pressable>
          </View>
        </>
      )}

      {mode === 'swap' && (
        <View style={styles.flowWrap}>
          {swapStep === 'ask' && (
            <View>
              <Text style={styles.title}>What are you craving?</Text>
              <Text style={styles.subtitle}>Tell Suki, and she&apos;ll find something lighter that hits the same spot.</Text>
              <TextField
                value={craving}
                onChangeText={setCraving}
                placeholder="Chocolate, ice cream, jalebi…"
                placeholderTextColor="rgba(242,246,232,.5)"
                style={styles.swapInput}
                autoFocus
              />
              <Button label="Get a swap" onPress={() => runSwap(craving)} disabled={!craving.trim()} fullWidth style={styles.swapBtn} />
              <Pressable onPress={() => runSwap('something sweet')} style={styles.somethingSweetBtn}>
                <Text style={styles.somethingSweetLabel}>Just something sweet</Text>
              </Pressable>
            </View>
          )}

          {swapStep === 'busy' && (
            <View style={styles.busyWrap}>
              <SukiBunny mood="happy" size={80} />
              <Text style={[styles.title, styles.busyTitle]}>Finding a swap…</Text>
            </View>
          )}

          {swapStep === 'result' && (
            <View>
              <View style={styles.resultMascot}>
                <SukiBunny mood="cheer" size={72} />
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultText}>{suggestion}</Text>
              </View>
              <Button label="Try another" variant="secondary" onPress={() => runSwap(craving)} fullWidth style={styles.swapBtn} />
              <Pressable onPress={() => router.back()} style={styles.resistBtn}>
                <Text style={styles.resistLabel}>I&apos;m okay now</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {mode === 'timer' && (
        <View style={styles.flowWrap}>
          <View style={styles.timerHero}>
            <View style={styles.timerRingWrap}>
              {!timerDone && (
                <>
                  <BreathingRing color="rgba(174,191,146,.24)" delay={0} />
                  <BreathingRing color="rgba(174,191,146,.2)" delay={600} />
                </>
              )}
              <Svg width={190} height={190} viewBox="0 0 190 190" style={styles.timerSvg}>
                <G rotation={-90} origin="95, 95">
                  <Circle cx={95} cy={95} r={RING_R} fill="none" stroke="rgba(242,246,232,.18)" strokeWidth={8} />
                  <Circle
                    cx={95}
                    cy={95}
                    r={RING_R}
                    fill="none"
                    stroke="#ccdbb2"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={`${timerProgress * RING_C}, ${RING_C}`}
                  />
                </G>
              </Svg>
              <View style={styles.timerCenter}>
                <SukiBunny mood={mascotMood} size={64} />
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              </View>
            </View>
            <Text style={[styles.title, styles.timerTitle]}>{timerDone ? 'You made it.' : 'Just breathe. It passes.'}</Text>
            <Text style={styles.subtitle}>
              {timerDone ? 'That craving lost — nice work.' : 'Inhale as the ring fills, exhale as it fades.'}
            </Text>
          </View>

          {timerDone ? (
            <Pressable onPress={() => router.back()} style={styles.resistBtn}>
              <Text style={styles.resistLabel}>I&apos;m okay now</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setTimerRunning((r) => !r)} style={styles.pauseBtn}>
              <Text style={styles.pauseLabel}>{timerRunning ? 'Pause' : 'Resume'}</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(242,246,232,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: SOS_TEXT,
    opacity: 0.65,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  breatheWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 96,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 27,
    color: SOS_TEXT,
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 31,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: SOS_TEXT,
    opacity: 0.82,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    marginVertical: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(242,246,232,.28)',
    borderRadius: radii.lg,
    padding: 16,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(242,246,232,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: SOS_TEXT,
  },
  cardSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: SOS_TEXT,
    opacity: 0.78,
    marginTop: 2,
  },
  footer: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 20,
  },
  resistBtn: {
    borderRadius: 999,
    paddingVertical: 19,
    alignItems: 'center',
    backgroundColor: '#ccdbb2',
  },
  resistLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: '#2e3320',
  },
  gaveInBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gaveInLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(242,246,232,.8)',
  },
  flowWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  swapInput: {
    marginTop: 18,
    marginBottom: 12,
    backgroundColor: 'rgba(242,246,232,.1)',
    borderColor: 'rgba(242,246,232,.3)',
    color: SOS_TEXT,
  },
  swapBtn: {
    marginTop: 4,
  },
  somethingSweetBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  somethingSweetLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(242,246,232,.8)',
    textDecorationLine: 'underline',
  },
  busyWrap: {
    alignItems: 'center',
  },
  busyTitle: {
    marginTop: 14,
  },
  resultMascot: {
    alignItems: 'center',
    marginBottom: 14,
  },
  resultCard: {
    backgroundColor: 'rgba(242,246,232,.12)',
    borderRadius: radii.lg,
    padding: 22,
    marginBottom: 16,
  },
  resultText: {
    fontFamily: fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    color: SOS_TEXT,
    textAlign: 'center',
  },
  timerHero: {
    alignItems: 'center',
  },
  timerRingWrap: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerCenter: {
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: SOS_TEXT,
    fontVariant: ['tabular-nums'],
  },
  timerTitle: {
    marginTop: 20,
  },
  pauseBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(242,246,232,.3)',
    marginTop: 20,
  },
  pauseLabel: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: SOS_TEXT,
  },
});
