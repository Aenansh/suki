import { useEffect, useState } from 'react';

import { runMidnightCheck } from '@/services/midnight';

/** Runs the midnight rollover check once the caller says the DB/user store is ready. Returns
 * whether it's done, so app/_layout.tsx can hold the splash screen until rollover has settled —
 * otherwise a screen could mount and read pre-rollover streak/points for a frame. */
export function useMidnightCheck(ready: boolean): boolean {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!ready || checked) return;
    runMidnightCheck().finally(() => setChecked(true));
  }, [ready, checked]);

  return checked;
}
