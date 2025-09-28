import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeWindStyleSheet } from "nativewind";
import {
  Appearance,
  AppearancePreferences,
} from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  conviven: {
    orange: string;
    peach: string;
    blue: string;
  };
};

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "@conviven/theme";

const LIGHT_COLORS: ThemeColors = {
  background: "#ffffff",
  foreground: "#111827",
  card: "#ffffff",
  cardForeground: "#111827",
  muted: "#f8fafc",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#007BFF",
  primary: "#007BFF",
  primaryForeground: "#ffffff",
  secondary: "#FEC6A1",
  secondaryForeground: "#7c2d12",
  accent: "#FDE1D3",
  accentForeground: "#7c2d12",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  sidebarBackground: "#ffffff",
  sidebarForeground: "#1f2937",
  sidebarBorder: "#e5e7eb",
  sidebarRing: "#007BFF",
  conviven: {
    orange: "#FEC6A1",
    peach: "#FDE1D3",
    blue: "#007BFF",
  },
};

const DARK_COLORS: ThemeColors = {
  background: "#0f172a",
  foreground: "#e2e8f0",
  card: "#1e293b",
  cardForeground: "#f8fafc",
  muted: "#1f2937",
  mutedForeground: "#cbd5f5",
  border: "#334155",
  input: "#334155",
  ring: "#60a5fa",
  primary: "#007BFF",
  primaryForeground: "#ffffff",
  secondary: "#FEC6A1",
  secondaryForeground: "#422006",
  accent: "#FDE1D3",
  accentForeground: "#7c2d12",
  destructive: "#f87171",
  destructiveForeground: "#0b1120",
  sidebarBackground: "#111827",
  sidebarForeground: "#e2e8f0",
  sidebarBorder: "#1f2937",
  sidebarRing: "#60a5fa",
  conviven: {
    orange: "#FEC6A1",
    peach: "#FDE1D3",
    blue: "#007BFF",
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): ThemeMode =>
  Appearance.getColorScheme() === "dark" ? "dark" : "light";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getSystemTheme);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
          setHasStoredPreference(true);
        } else {
          setThemeState(getSystemTheme());
          setHasStoredPreference(false);
        }
      } catch (error) {
        setThemeState(getSystemTheme());
        setHasStoredPreference(false);
      }
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAppearanceChange = ({ colorScheme }: AppearancePreferences) => {
      if (hasStoredPreference) {
        return;
      }

      if (colorScheme === "light" || colorScheme === "dark") {
        setThemeState(colorScheme);
      }
    };

    const subscription = Appearance.addChangeListener(handleAppearanceChange);

    return () => {
      subscription.remove();
    };
  }, [hasStoredPreference]);

  useEffect(() => {
    NativeWindStyleSheet.setColorScheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setHasStoredPreference(true);
    setThemeState(nextTheme);
    AsyncStorage.setItem(STORAGE_KEY, nextTheme).catch(() => undefined);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const colors = useMemo(() => (theme === "dark" ? DARK_COLORS : LIGHT_COLORS), [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      colors,
      setTheme,
      toggleTheme,
    }),
    [colors, setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
