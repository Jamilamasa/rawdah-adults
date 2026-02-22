'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Drop-in replacement for useState that persists form state to sessionStorage.
 * State is cleared on tab/window close (sessionStorage semantics).
 *
 * @param key      - Unique storage key (namespaced, e.g. 'form:tasks')
 * @param defaultValue - Initial / reset value, same as useState default
 * @param omit     - Optional list of keys to exclude from storage (e.g. password fields)
 * @returns [state, setState, clear] — clear() removes from storage and resets to default
 */
export function useSessionForm<T>(
  key: string,
  defaultValue: T,
  omit?: readonly string[]
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const defaultRef = useRef(defaultValue);

  const [state, setStateRaw] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as unknown;
        // For objects: merge stored data onto the default so omitted/new keys
        // always have a defined value
        if (
          typeof defaultValue === 'object' &&
          defaultValue !== null &&
          typeof parsed === 'object' &&
          parsed !== null
        ) {
          return { ...defaultValue, ...(parsed as object) } as T;
        }
        return parsed as T;
      }
    } catch {
      // corrupted storage or SSR — fall through to default
    }
    return defaultValue;
  });

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStateRaw((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        try {
          let toStore: unknown = next;
          if (omit && omit.length > 0 && typeof next === 'object' && next !== null) {
            toStore = Object.fromEntries(
              Object.entries(next as Record<string, unknown>).filter(([k]) => !omit.includes(k))
            );
          }
          sessionStorage.setItem(key, JSON.stringify(toStore));
        } catch {
          // storage quota exceeded or unavailable — fail silently
        }
        return next;
      });
    },
    [key, omit]
  );

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // no-op
    }
    setStateRaw(defaultRef.current);
  }, [key]);

  return [state, setState, clear];
}
