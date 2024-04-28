import { useCallback, useRef } from 'react';

export const useDebounce = <T extends any[]>(cb: (...args: T) => void, delay: number) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: T) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      cb(...args);
    }, delay);
  }, [cb, delay]);
};
