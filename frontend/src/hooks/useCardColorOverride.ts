'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Per-user color preference for a single card. Stored in localStorage so
 * the user's chosen colour follows them around the same browser without
 * needing a backend column.
 *
 * Storage key shape: `qk:card-color:{kind}:{id}`
 *   kind = 'exam' | 'classroom' (free string — caller chooses)
 *   id   = workspace / classroom id
 *
 * Returns `[override, setOverride]` where `override` is the saved color
 * variant (string) or null if the user has not chosen one yet. Pages
 * fall back to their default rotation when override is null.
 */
export function useCardColorOverride<Variant extends string>(
  kind: string,
  id: number | string,
): readonly [Variant | null, (next: Variant | null) => void] {
  const key = `qk:card-color:${kind}:${id}`;
  const [value, setValue] = useState<Variant | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) setValue(stored as Variant);
    } catch {
      // ignore — private mode / disabled storage
    }
    const handler = (e: StorageEvent) => {
      if (e.key === key) setValue((e.newValue as Variant) || null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const update = useCallback(
    (next: Variant | null) => {
      setValue(next);
      if (typeof window === 'undefined') return;
      try {
        if (next === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, next);
        }
      } catch {
        // ignore
      }
    },
    [key],
  );

  return [value, update] as const;
}
