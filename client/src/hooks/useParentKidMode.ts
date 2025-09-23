import { useState, useEffect } from 'react';

const STORAGE_KEY = 'eliterigs-parent-kid-mode';

export function useParentKidMode() {
  const [isParentKidMode, setIsParentKidMode] = useState<boolean>(() => {
    // Initialize from localStorage or default to false for new users
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to parse parent/kid mode from localStorage:', error);
      return false;
    }
  });

  // Persist to localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isParentKidMode));
    } catch (error) {
      console.warn('Failed to save parent/kid mode to localStorage:', error);
    }
  }, [isParentKidMode]);

  const toggleParentKidMode = () => {
    setIsParentKidMode((prev) => !prev);
  };

  const enableParentKidMode = () => {
    setIsParentKidMode(true);
  };

  const disableParentKidMode = () => {
    setIsParentKidMode(false);
  };

  return {
    isParentKidMode,
    toggleParentKidMode,
    enableParentKidMode,
    disableParentKidMode,
  };
}
