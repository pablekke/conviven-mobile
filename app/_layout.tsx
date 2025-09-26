import "../global.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProviders } from "@/src/providers/AppProviders";
import { convivenFonts } from "@/src/theme/fonts";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop */
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [providersReady, setProvidersReady] = useState(false);
  const [fontsLoaded] = useFonts(convivenFonts);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      colorScheme === "dark" ? "#000000" : "#FFFFFF"
    ).catch(() => undefined);
  }, [colorScheme]);

  const handleProvidersReady = useCallback(() => {
    setProvidersReady(true);
  }, []);

  const hideSplash = useCallback(async () => {
    if (providersReady && fontsLoaded) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn("Failed to hide splash screen", error);
      }
    }
  }, [fontsLoaded, providersReady]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  const theme = useMemo(
    () => (colorScheme === "dark" ? DarkTheme : DefaultTheme),
    [colorScheme]
  );

  return (
    <AppProviders onReady={handleProvidersReady}>
      {fontsLoaded && providersReady ? (
        <ThemeProvider value={theme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      ) : (
        <LoadingScreen />
      )}
    </AppProviders>
  );
}
