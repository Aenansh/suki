import { useColorScheme } from 'react-native';

import { getTheme, type SemanticTheme } from '@/constants/theme';
import { useThemeStore } from '@/stores/themeStore';

/** System color scheme, overridable in-app via the home header's theme toggle. */
export function useAppTheme(): SemanticTheme & { scheme: 'light' | 'dark' } {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const override = useThemeStore((s) => s.override);
  const scheme = override === 'system' ? systemScheme : override;
  return { ...getTheme(scheme), scheme };
}
