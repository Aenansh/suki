import { Check, Clock, RefreshCw } from 'lucide-react-native';

import type { SukiMood } from '@/components/mascot/SukiBunny';
import { useAppTheme } from './useAppTheme';

/**
 * The three-tier sugar-ring status, ported from the design's `statusMap`/`ringColor` logic
 * (docs/design/tokens.md). Shared by the home ring and its status banner so they never disagree.
 */
export function useSugarStatus(sugar: number, limit: number) {
  const t = useAppTheme();
  const pct = limit > 0 ? Math.min(1, sugar / limit) : 0;
  const over = sugar > limit;
  const near = !over && pct >= 0.8;
  const saved = Math.max(0, limit - sugar);

  const ringColor = over ? t.accent : near ? '#e0a13f' : t.sage;
  const mascotMood: Extract<SukiMood, 'happy' | 'warm'> = over ? 'warm' : 'happy';

  const status = over
    ? {
        bg: t.accentBg,
        ink: t.accentInk,
        iconBg: t.accent,
        Icon: RefreshCw,
        text: `${Math.round(sugar - limit)}g over. Recovery mode — your streak is safe.`,
      }
    : near
      ? {
          bg: t.goldBg,
          ink: t.goldInk,
          iconBg: '#e0a13f',
          Icon: Clock,
          text: `${Math.round(saved)}g left — worth saving for something you enjoy.`,
        }
      : {
          bg: t.sageBg,
          ink: t.sageInk,
          iconBg: t.sage,
          Icon: Check,
          text: `${Math.round(saved)}g under budget, which banks ${Math.round(saved)} points if the day holds.`,
        };

  return { pct, over, near, saved, ringColor, mascotMood, ...status };
}
