import { useState, useEffect, useRef } from 'react';

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.warn('Failed to parse sticky state:', e);
      return defaultValue;
    }
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Failed to save sticky state:', e);
      }
    } else {
      isMounted.current = true;
    }
  }, [key, value]);

  return [value, setValue];
}
