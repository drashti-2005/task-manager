'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Provider component that wraps the app and makes theme object available to any child component that calls useTheme()
export function ThemeProvider({ children }) {
  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Initialize theme state
  const [theme, setTheme] = useState('light');
  
  // Initialize loading state
  const [loading, setLoading] = useState(true);

  // Check for saved theme preference or system preference when the component mounts
  useEffect(() => {
    if (isBrowser) {
      // Check for saved theme in localStorage
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
      
      setLoading(false);
    }
  }, [isBrowser]);

  // Update the document class when theme changes
  useEffect(() => {
    if (isBrowser && !loading) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme, isBrowser, loading]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    loading
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}