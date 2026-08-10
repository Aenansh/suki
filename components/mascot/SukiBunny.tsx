import Svg from 'react-native-svg';

import { Calm } from './expressions/Calm';
import { Cheer } from './expressions/Cheer';
import { Happy } from './expressions/Happy';
import { Warm } from './expressions/Warm';

export type SukiMood = 'happy' | 'cheer' | 'warm' | 'calm';

type Props = {
  /** Design mood. CLAUDE.md's excited/celebrating map to `cheer`; thoughtful/encouraging map to `happy`. */
  mood?: SukiMood;
  /** Width in px — height follows the mascot's 100:118 aspect ratio automatically. */
  size?: number;
};

const VIEWBOX_W = 100;
const VIEWBOX_H = 118;

/** The Suki bunny mascot, straight from the Claude Design source (SukiBunny.dc.html). */
export function SukiBunny({ mood = 'happy', size = 64 }: Props) {
  const height = (size / VIEWBOX_W) * VIEWBOX_H;
  return (
    <Svg width={size} height={height} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}>
      {mood === 'happy' && <Happy />}
      {mood === 'cheer' && <Cheer />}
      {mood === 'warm' && <Warm />}
      {mood === 'calm' && <Calm />}
    </Svg>
  );
}
