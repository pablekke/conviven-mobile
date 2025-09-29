import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance } from "react-native";

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
  background: "#F9FAFB",
  foreground: "#111827",
  card: "#FFFFFF",
  cardForeground: "#111827",
  muted: "#F3F4F6",
  mutedForeground: "#4B5563",
  border: "#E5E7EB",
  input: "#E5E7EB",
  ring: "#2563EB",
  primary: "#2563EB",
  primaryForeground: "#FFFFFF",
  secondary: "#F97316",
  secondaryForeground: "#311E0A",
  accent: "#FDE8D7",
  accentForeground: "#7C2D12",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",
  sidebarBackground: "#FFFFFF",
  sidebarForeground: "#1F2937",
  sidebarBorder: "#E5E7EB",
  sidebarRing: "#2563EB",
  conviven: {
    orange: "#F4A261",
    peach: "#FDE8D7",
    blue: "#2563EB",
  },
};

const DARK_COLORS: ThemeColors = {
  // Gris neutro estándar (menos azulado)
  background: "#1f1f1f",
  foreground: "#e6e6e6",
  card: "#262626",
  cardForeground: "#f2f2f2",
  muted: "#2b2b2b",
  mutedForeground: "#b3b3b3",
  border: "#3a3a3a",
  input: "#3a3a3a",
  ring: "#60a5fa",
  primary: "#60a5fa",
  primaryForeground: "#FFFFFF",
  secondary: "#F4A261",
  secondaryForeground: "#1F2937",
  accent: "#2e2e2e",
  accentForeground: "#e6e6e6",
  destructive: "#f87171",
  destructiveForeground: "#FFFFFF",
  sidebarBackground: "#1c1c1c",
  sidebarForeground: "#e6e6e6",
  sidebarBorder: "#333333",
  sidebarRing: "#60a5fa",
  conviven: {
    orange: "#F4A261",
    peach: "#FDE8D7",
    blue: "#60A5FA",
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): ThemeMode => (Appearance.getColorScheme() === "dark" ? "dark" : "light");

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
    const handleAppearanceChange = ({ colorScheme }: any) => {
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

  // NativeWind color scheme is controlled elsewhere via useColorScheme

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
