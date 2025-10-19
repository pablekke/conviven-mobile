import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { STATUS_PAGE_URL } from "@/config/env";
import { flushQueuedRequests } from "@/services/apiClient";
import { loadRemoteConfig, RemoteConfig } from "@/services/remoteConfigService";
import { persistentRequestQueue } from "@/services/resilience/requestQueue";
import { errorEmitter, maintenanceEmitter, offlineEmitter, queueEmitter } from "@/services/resilience/state";
import { networkMonitor } from "@/services/resilience/networkMonitor";

interface ResilienceContextValue {
  offline: boolean;
  lastErrorMessage: string | null;
  maintenance: boolean;
  maintenanceMessage?: string;
  statusPageUrl: string;
  queueSize: number;
  refreshRemoteConfig: () => Promise<void>;
  flushQueue: () => Promise<void>;
}

const ResilienceContext = createContext<ResilienceContextValue | undefined>(undefined);

export function ResilienceProvider({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | undefined>(undefined);
  const [statusPageUrl, setStatusPageUrl] = useState<string>(STATUS_PAGE_URL);

  useEffect(() => {
    const unsubscribeOffline = offlineEmitter.subscribe(({ active }) => {
      setOffline(active);
      if (!active) {
        setLastErrorMessage(null);
      }
    });

    const unsubscribeError = errorEmitter.subscribe(payload => {
      setLastErrorMessage(payload?.message ?? null);
    });

    const unsubscribeQueue = queueEmitter.subscribe(({ pending }) => {
      setQueueSize(pending);
    });

    const unsubscribeMaintenance = maintenanceEmitter.subscribe(({ active, message, statusPageUrl }) => {
      setMaintenance(active);
      setMaintenanceMessage(message);
      if (statusPageUrl) {
        setStatusPageUrl(statusPageUrl);
      }
    });

    persistentRequestQueue.size().then(size => setQueueSize(size)).catch(() => setQueueSize(0));

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
      const config = await loadRemoteConfig();
      if (!mounted) {
        return;
      }
      applyRemoteConfig(config);
    };

    init().catch(error => console.warn("resilience:config:init:error", error));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(isOnline => {
      if (isOnline) {
        flushQueuedRequests().catch(error => console.warn("resilience:flush:error", error));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const applyRemoteConfig = (config: RemoteConfig) => {
    setStatusPageUrl(config.statusPageUrl);
    setMaintenance(config.maintenanceMode);
    setMaintenanceMessage(config.maintenanceMessage);
  };

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
