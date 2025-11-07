import { createContext, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

import { flushQueuedRequests } from "@/services/apiClient";
import { loadRemoteConfig, RemoteConfig } from "@/services/remoteConfigService";
import { persistentRequestQueue } from "@/services/resilience/requestQueue";
import {
  errorEmitter,
  maintenanceEmitter,
  offlineEmitter,
  queueEmitter,
} from "@/services/resilience/state";
import { networkMonitor } from "@/services/resilience/networkMonitor";

interface ResilienceContextValue {
  offline: boolean;
  lastErrorMessage: string | null;
  maintenance: boolean;
  maintenanceMessage?: string;
  statusPageUrl?: string;
  queueSize: number;
  refreshRemoteConfig: () => Promise<void>;
  flushQueue: () => Promise<void>;
}

const ResilienceContext = createContext<ResilienceContextValue | undefined>(undefined);

export function ResilienceProvider({ children }: { children: React.ReactNode }) {
  const [offlineSignal, setOfflineSignal] = useState(false);
  const [networkOffline, setNetworkOffline] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | undefined>(undefined);
  const [statusPageUrl, setStatusPageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribeOffline = offlineEmitter.subscribe(({ active }) => {
      setOfflineSignal(active);
    });

    const unsubscribeError = errorEmitter.subscribe(payload => {
      setLastErrorMessage(payload?.message ?? null);
    });

    const unsubscribeQueue = queueEmitter.subscribe(({ pending }) => {
      setQueueSize(pending);
    });

    const unsubscribeMaintenance = maintenanceEmitter.subscribe(({ active, message }) => {
      setMaintenance(active);
      setMaintenanceMessage(message);
    });

    persistentRequestQueue
      .size()
      .then(size => setQueueSize(size))
      .catch(() => setQueueSize(0));

    return () => {
      unsubscribeOffline();
      unsubscribeError();
      unsubscribeQueue();
      unsubscribeMaintenance();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const config = await loadRemoteConfig();
        if (!mounted) {
          return;
        }
        applyRemoteConfig(config);
      } catch (error) {
        console.warn("resilience:config:init:error", error);
        // No bloquear la UI si falla la carga de config
        if (mounted) {
          // Valores por defecto si falla la carga
          setMaintenance(false);
          setMaintenanceMessage(undefined);
          setStatusPageUrl(undefined);
        }
      }
    };

    // Timeout para evitar bloqueos infinitos
    const timeout = setTimeout(() => {
      if (mounted) {
        setMaintenance(false);
        setMaintenanceMessage(undefined);
        setStatusPageUrl(undefined);
      }
    }, 5000);

    init();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(isOnline => {
      if (isOnline) {
        // Timeout para evitar bloqueos en flush
        const timeout = setTimeout(() => {
          flushQueuedRequests().catch(error => console.warn("resilience:flush:error", error));
        }, 1000);

        return () => clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = NetInfo.addEventListener(state => {
      const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setNetworkOffline(!isConnected);
      offlineEmitter.emit({ active: !isConnected });
    });

    NetInfo.fetch()
      .then(state => {
        const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
        setNetworkOffline(!isConnected);
        offlineEmitter.emit({ active: !isConnected });
      })
      .catch(() => undefined);

    return () => {
      subscription();
    };
  }, []);

  useEffect(() => {
    if (!offlineSignal && !networkOffline) {
      setLastErrorMessage(null);
    }
  }, [offlineSignal, networkOffline]);

  const applyRemoteConfig = (config: RemoteConfig) => {
    setMaintenance(config.maintenanceMode);
    setMaintenanceMessage(config.maintenanceMessage);
    setStatusPageUrl(config.statusPageUrl || undefined);
  };

  const offline = offlineSignal || networkOffline;

  const value = useMemo<ResilienceContextValue>(
    () => ({
      offline,
      lastErrorMessage,
      maintenance,
      maintenanceMessage,
      statusPageUrl,
      queueSize,
      refreshRemoteConfig: async () => {
        const config = await loadRemoteConfig();
        applyRemoteConfig(config);
      },
      flushQueue: async () => {
        await flushQueuedRequests();
      },
    }),
    [offline, lastErrorMessage, maintenance, maintenanceMessage, statusPageUrl, queueSize],
  );

  return <ResilienceContext.Provider value={value}>{children}</ResilienceContext.Provider>;
}

export function useResilience(): ResilienceContextValue {
  const context = useContext(ResilienceContext);
  if (!context) {
    throw new Error("useResilience debe usarse dentro de ResilienceProvider");
  }
  return context;
}
