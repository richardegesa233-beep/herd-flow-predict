import { useState, useEffect, useCallback } from "react";

function getUserKey(key: string): string {
  try {
    const session = window.localStorage.getItem("fhps-session");
    if (session) {
      const user = JSON.parse(session);
      return `fhps-${user.id}-${key}`;
    }
  } catch {}
  return `fhps-guest-${key}`;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const userKey = getUserKey(key);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(userKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(userKey, JSON.stringify(storedValue));
    } catch {
      // Storage full or unavailable
    }
  }, [userKey, storedValue]);

  const clear = useCallback(() => {
    setStoredValue(initialValue);
    window.localStorage.removeItem(userKey);
  }, [userKey, initialValue]);

  return [storedValue, setStoredValue, clear] as const;
}
