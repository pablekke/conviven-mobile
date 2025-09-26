import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";

import { queryClient } from "@/src/core/api/queryClient";
import { persistor, store } from "@/src/core/store/store";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";
import { AuthProvider } from "./auth/AuthProvider";
import { ToastProvider } from "./toast/ToastProvider";

type AppProvidersProps = PropsWithChildren<{
  onReady?: () => void;
}>;

export const AppProviders = ({ children, onReady }: AppProvidersProps) => {
  const [persistReady, setPersistReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const handlePersistReady = useCallback(() => setPersistReady(true), []);
  const handleAuthReady = useCallback(() => setAuthReady(true), []);

  useEffect(() => {
    if (persistReady && authReady) {
      onReady?.();
    }
  }, [authReady, onReady, persistReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate
          loading={<LoadingScreen />}
          persistor={persistor}
          onBeforeLift={handlePersistReady}
        >
          <QueryClientProvider client={queryClient}>
            <AuthProvider onReady={handleAuthReady}>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};
