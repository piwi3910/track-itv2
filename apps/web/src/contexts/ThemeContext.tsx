import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: (value?: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user } = useAuth();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  useEffect(() => {
    // Check user preference
    if (user?.theme) {
      if (user.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setColorScheme(mediaQuery.matches ? 'dark' : 'light');
        
        // Listen for system theme changes
        const handler = (e: MediaQueryListEvent): void => {
          setColorScheme(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      } else {
        setColorScheme(user.theme as ColorScheme);
      }
    }
  }, [user?.theme]);

  const toggleColorScheme = (value?: ColorScheme): void => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    
    // Apply theme to document
    if (nextColorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Apply initial theme
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorScheme]);

  const value = {
    colorScheme,
    toggleColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          {children}
        </MantineProvider>
      </ColorSchemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}