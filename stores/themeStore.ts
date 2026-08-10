import { create } from 'zustand';

type ThemeOverride = 'system' | 'light' | 'dark';

interface ThemeState {
  /** In-memory only (not persisted) — the design's home-header moon toggle. Defaults to following the OS. */
  override: ThemeOverride;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  override: 'system',
  toggle: () => {
    const current = get().override;
    set({ override: current === 'dark' ? 'light' : 'dark' });
  },
}));
