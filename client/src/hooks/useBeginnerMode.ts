import { useState, useEffect } from 'react';

const STORAGE_KEY = 'eliterigs-beginner-mode';

export function useBeginnerMode() {
  const [isBeginnerMode, setIsBeginnerMode] = useState<boolean>(() => {
    // Initialize from localStorage or default to true for new users
    if (typeof window === 'undefined') return true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : true;
    } catch (error) {
      console.warn('Failed to parse beginner mode from localStorage:', error);
      return true;
    }
  });

  // Persist to localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isBeginnerMode));
    } catch (error) {
      console.warn('Failed to save beginner mode to localStorage:', error);
    }
  }, [isBeginnerMode]);

  const toggleBeginnerMode = () => {
    setIsBeginnerMode((prev) => !prev);
  };

  const enableBeginnerMode = () => {
    setIsBeginnerMode(true);
  };

  const disableBeginnerMode = () => {
    setIsBeginnerMode(false);
  };

  return {
    isBeginnerMode,
    toggleBeginnerMode,
    enableBeginnerMode,
    disableBeginnerMode,
  };
}
