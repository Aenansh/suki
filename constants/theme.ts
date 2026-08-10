/**
 * Design tokens — hand-translated from the "Organic" Claude Design system
 * (project 861fbdd1-95c6-4ca1-a69b-ab0b0603abfa, see docs/design/tokens.md).
 * RN has no CSS variables, so every screen/component reads values from here —
 * never hard-code a hex, a font name, or a px value the tokens already carry.
 */
import { Platform } from 'react-native';

import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';

export const fonts = {
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 28,
  card: 32, // --radius-lg * 1.15, used by .card/.dialog
  pill: 999, // buttons, inputs, tags, segmented control
} as const;

export const space = {
  1: 4.4,
  2: 8.8,
  3: 13.2,
  4: 17.6,
  6: 26.4,
  8: 35.2,
} as const;

/** Tonal ramps, generated in OKLCH on one shared lightness scale (styles.css). */
export const ramp = {
  neutral: {
    100: '#f9f4ed',
    200: '#eee7db',
    300: '#dcd3c4',
    400: '#c0b6a5',
    500: '#a19786',
    600: '#82796a',
    700: '#645c50',
    800: '#474238',
    900: '#2e2b25',
  },
  accent: {
    100: '#fff2eb',
    200: '#ffe1d0',
    300: '#ffc6a5',
    400: '#f6a06b',
    500: '#d67f48',
    600: '#b2622d',
    700: '#8c491a',
    800: '#643312',
    900: '#402310',
  },
  sage: {
    100: '#f0fae1',
    200: '#e1eecc',
    300: '#ccdbb2',
    400: '#aebf92',
    500: '#8fa073',
    600: '#728157',
    700: '#56633f',
    800: '#3d472b',
    900: '#272e1b',
  },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#2e2b25',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2e2b25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2e2b25',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 10,
  },
} as const;

export interface SemanticTheme {
  page: string;
  bg: string;
  surface: string;
  track: string;
  text: string;
  muted: string;
  faint: string;
  line: string;
  accent: string;
  accentBg: string;
  accentInk: string;
  sage: string;
  sageBg: string;
  sageInk: string;
  sageInk2: string;
  goldBg: string;
  goldInk: string;
  sosBg: string;
  toast: string;
}

/**
 * Semantic screen tokens — exact light/dark pairs pulled from Suki.dc.html's
 * own theme script (see docs/design/tokens.md for the source table).
 */
export const semantic: { light: SemanticTheme; dark: SemanticTheme } = {
  light: {
    page: '#eee7db',
    bg: '#f5ead8',
    surface: '#ebddc5',
    track: '#dcd3c4',
    text: '#201e1d',
    muted: '#645c50',
    faint: '#82796a',
    line: '#dcd3c4',
    accent: '#c67139',
    accentBg: '#ffe1d0',
    accentInk: '#8c491a',
    sage: '#7a8a5e',
    sageBg: '#e1eecc',
    sageInk: '#3d472b',
    sageInk2: '#56633f',
    goldBg: '#f6e6c4',
    goldInk: '#7a5710',
    sosBg: '#3d472b',
    toast: '#2e2b25',
  },
  dark: {
    page: '#211d18',
    bg: '#2b2620',
    surface: '#37312a',
    track: '#474238',
    text: '#f5ead8',
    muted: '#c0b6a5',
    faint: '#a19786',
    line: '#474238',
    accent: '#d67f48',
    accentBg: '#4a3524',
    accentInk: '#ffc6a5',
    sage: '#8fa073',
    sageBg: '#333c26',
    sageInk: '#ccdbb2',
    sageInk2: '#aebf92',
    goldBg: '#463a1e',
    goldInk: '#e8c98a',
    sosBg: '#272e1b',
    toast: '#0f0e0c',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

export function getTheme(scheme: ColorScheme): SemanticTheme {
  return semantic[scheme];
}

/** Font family names as loaded by @expo-google-fonts/{caprasimo,figtree} in app/_layout.tsx. */
export const fontAssets = {
  Caprasimo_400Regular,
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
};

export const iconStrokeWidth = 2.75;

/** Android needs an explicit ripple/opacity fallback; iOS gets native opacity dimming. */
export const pressedOpacity = Platform.select({ ios: 0.85, default: 0.85 });
