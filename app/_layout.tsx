import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ConnectionErrorState from "../components/ConnectionErrorState";
import MaintenanceScreen from "../components/MaintenanceScreen";
import { View, Text as RNText, StyleSheet } from "react-native";
import LoadingScreen from "../components/LoadingScreen";
import CustomToast from "../components/CustomToast";
import { useFonts } from "expo-font";

import { ResilienceProvider, useResilience } from "../context/ResilienceContext";
import { useAuthNavigation, useLoadingScreenTransition } from "../hooks";
import { DataPreloadProvider } from "../context/DataPreloadContext";
import { ReactQueryProvider } from "../context/QueryClientProvider";
import { ChatProvider } from "@/features/chat/context/ChatContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import OfflineBanner from "../components/OfflineBanner";
import { AuthProvider } from "../context/AuthContext";

import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AuthRoot() {
  const { colors, isDark } = useTheme();
  const { showLoading, shouldSlideOut, handleAnimationComplete } = useLoadingScreenTransition();

  useAuthNavigation();

  return (
    <>
      <StatusBar style={showLoading ? "light" : isDark ? "light" : "dark"} />
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
      {showLoading && (
        <LoadingScreen
          shouldSlideOut={shouldSlideOut}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
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

  const isSplashScreenHidden = useRef(false);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isSplashScreenHidden.current) {
      isSplashScreenHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ResilienceProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <DataPreloadProvider>
                  <ChatProvider>
                    <ThemeDefaults />
                    <ThemedTree />
                  </ChatProvider>
                </DataPreloadProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </ResilienceProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      <CustomToast />
    </GestureHandlerRootView>
  );
}

function ThemedTree() {
  const { theme, colors } = useTheme();

  return (
    <SafeAreaView
      key={theme}
      style={[styles.themedTree, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <ResilienceWrapper />
    </SafeAreaView>
  );
}

function ResilienceWrapper() {
  const { maintenance, isLoadingStartup, isStartupError, retryStartup } = useResilience();

  if (isLoadingStartup) {
    return <LoadingScreen />
  }

  if (isStartupError) {
    return (
      <View style={styles.fullScreen}>
        <ConnectionErrorState
          onRetry={retryStartup}
          message="No pudimos conectar con el servidor. Por favor, revisá tu conexión e intentá nuevamente."
        />
      </View>
    );
  }

  return (
    <>
      <OfflineBanner />
      <View style={styles.content}>{maintenance ? <MaintenanceScreen /> : <AuthRoot />}</View>
    </>
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
