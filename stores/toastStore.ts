import { create } from 'zustand';

export type ToastVariant = 'success' | 'warning';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

const AUTO_HIDE_MS = 2800;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

/** A single, app-wide toast — rendered once at the root (components/ui/Toast.tsx, mounted in
 * app/_layout.tsx) so it survives screen transitions instead of being scoped to one screen.
 * Matches the design's toast pattern (bottom pill, auto-dismiss ~2.8s). */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: 'success',

  show: (message, variant = 'success') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, variant });
    hideTimer = setTimeout(() => set({ message: null }), AUTO_HIDE_MS);
  },

  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message: null });
  },
}));
