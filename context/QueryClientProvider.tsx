import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Auto-refetch on reconnect
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

// Auto-refetch on app focus
function onAppStateChange(status: AppStateStatus) {
  if (status === "active") {
    focusManager.setFocused(true);
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos: Data se considera fresca por 5 min
      gcTime: 1000 * 60 * 60 * 24, // 24 horas: Data persiste en memoria/cache por 24hs si no hay red
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: "offlineFirst", // CRUCIAL: Permite leer cache si no hay red
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
