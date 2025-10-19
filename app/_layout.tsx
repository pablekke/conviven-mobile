import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View, Text as RNText, StyleSheet, LogBox } from "react-native";
import Spinner from "../components/Spinner";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { DataPreloadProvider, useDataPreload } from "../context/DataPreloadContext";
import { ResilienceProvider, useResilience } from "../context/ResilienceContext";

import OfflineBanner from "../components/OfflineBanner";
import MaintenanceScreen from "../components/MaintenanceScreen";

import "../global.css";
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AuthRoot() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isPreloading, preloadCompleted } = useDataPreload();
  const [showTransition, setShowTransition] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const getTargetRoute = useCallback(() => {
    if (!user?.firstName || !user?.lastName || !user?.departmentId || !user?.neighborhoodId) {
      return "/profile";
    }
    return "/(app)";
  }, [user]);

  const handleNavigation = useCallback(() => {
    const inAuthGroup = segments[0] === "auth";

    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(getTargetRoute());
    }
    // No redirigir si ya está en app - evita loops
  }, [isAuthenticated, segments, isLoading, router, getTargetRoute]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  useEffect(() => {
    if (isAuthenticated && preloadCompleted && !isPreloading) {
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 100); // Reducido de 300ms a 100ms

      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      setShowTransition(true);
    }
    // No mostrar transition si ya está autenticado y cargado
  }, [isAuthenticated, preloadCompleted, isPreloading]);

  const showLoading =
    isLoading || (!isAuthenticated && (isPreloading || !preloadCompleted || showTransition));

  if (showLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={[styles.fullScreen, { backgroundColor: colors.conviven.blue }]}
      >
        <Spinner size={52} color="#FFFFFF" trackColor="rgba(255,255,255,0.15)" thickness={5} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.primaryForeground,
          headerTitleStyle: {
            fontFamily: "Inter-SemiBold",
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="auth/login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: "Create Account",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

function ThemeDefaults() {
  const { colors } = useTheme();

  useEffect(() => {
    const TextAny = RNText as any;
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [TextAny.defaultProps.style, { color: colors.foreground }];
  }, [colors.foreground]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": { uri: "https://rsms.me/inter/font-files/Inter-Regular.ttf" },
    "Inter-Medium": { uri: "https://rsms.me/inter/font-files/Inter-Medium.ttf" },
    "Inter-SemiBold": { uri: "https://rsms.me/inter/font-files/Inter-SemiBold.ttf" },
    "Inter-Bold": { uri: "https://rsms.me/inter/font-files/Inter-Bold.ttf" },
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <SafeAreaProvider>
        <ThemeProvider>
          <ResilienceProvider>
            <AuthProvider>
              <DataPreloadProvider>
                <ThemeDefaults />
                <ThemedTree />
              </DataPreloadProvider>
            </AuthProvider>
          </ResilienceProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      <Toast />
    </>
  );
}

function ThemedTree() {
  const { theme, colors } = useTheme();
  const { maintenance } = useResilience();

  return (
    <SafeAreaView
      key={theme}
      style={[styles.themedTree, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <OfflineBanner />
      <View style={styles.content}>{maintenance ? <MaintenanceScreen /> : <AuthRoot />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  themedTree: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
