import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Mode: 'light' | 'dark'
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('study_library_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  });

  // Palette: 'notion' | 'warm'
  const [palette, setPaletteState] = useState(() => {
    const saved = localStorage.getItem('study_library_palette');
    if (saved === 'notion' || saved === 'warm') {
      return saved;
    }
    // Default to Notion palette as requested
    return 'notion';
  });

  useEffect(() => {
    localStorage.setItem('study_library_theme', theme);
    localStorage.setItem('study_library_palette', palette);

    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    if (palette === 'notion') {
      root.classList.add('theme-notion');
      root.classList.remove('theme-warm');
    } else {
      root.classList.add('theme-warm');
      root.classList.remove('theme-notion');
    }
  }, [theme, palette]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const setPalette = (newPalette) => {
    setPaletteState(newPalette);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        palette,
        isNotion: palette === 'notion',
        toggleTheme,
        setTheme,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

