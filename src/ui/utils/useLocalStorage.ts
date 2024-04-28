import { useCallback, useId, useMemo, useState } from 'react';

export function useLocalStorage<T>(key: string, initialState: T): [T, (newState: T) => void];
export function useLocalStorage<T>(key: string): [T | undefined, (newState: T) => void];
export function useLocalStorage<T>(key: string, initialState?: T) {
  const storedState = useMemo(() => {
    const rawValue = localStorage.getItem(key);
    if (typeof rawValue === 'string') {
      return JSON.parse(rawValue) as T;
    }

    return initialState;
  }, [key]);

  const [state, setState] = useState(storedState);

  const setLocalStorageState = useCallback((newState: T | ((c: T) => T)) => {
    const v = typeof newState === 'function' ? (newState as (c: T) => T)(state as T) : newState;
    localStorage.setItem(key, JSON.stringify(v));
    setState(v);
  }, [key, setState]);

  return [state, setLocalStorageState] as const;
};
