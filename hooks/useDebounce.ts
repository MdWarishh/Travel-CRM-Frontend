import { useState, useEffect } from 'react';

/**
 * Debounce a value — delays updating until after `delay` ms of no changes.
 *
 * @example
 * const debouncedSearch = useDebounce(searchText, 400);
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}