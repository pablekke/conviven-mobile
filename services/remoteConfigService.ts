import AsyncStorage from "@react-native-async-storage/async-storage";

import { MAINTENANCE_CONFIG_ENDPOINT, STATUS_PAGE_URL } from "@/config/env";
import { resilientRequest } from "./apiClient";

const REMOTE_CONFIG_KEY = "@resilience/remote-config";

export interface RemoteConfig {
  statusPageUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

const DEFAULT_CONFIG: RemoteConfig = {
  statusPageUrl: STATUS_PAGE_URL,
  maintenanceMode: false,
  maintenanceMessage: undefined,
};

export async function loadRemoteConfig(): Promise<RemoteConfig> {
  try {
    const data = await resilientRequest<any>({
      endpoint: MAINTENANCE_CONFIG_ENDPOINT,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      allowQueue: false,
      useCache: false,
    });

    const config: RemoteConfig = {
      statusPageUrl: data?.statusPageUrl ?? data?.status_page_url ?? STATUS_PAGE_URL,
      maintenanceMode: Boolean(data?.maintenanceMode ?? data?.maintenance ?? data?.isMaintenance),
      maintenanceMessage: data?.maintenanceMessage ?? data?.message ?? data?.notice,
    };

    await AsyncStorage.setItem(REMOTE_CONFIG_KEY, JSON.stringify(config));
    return config;
  } catch (error) {
    const cached = await AsyncStorage.getItem(REMOTE_CONFIG_KEY);
    if (cached) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(cached) } as RemoteConfig;
      } catch (parseError) {
        console.warn("remote-config:parse:error", parseError);
      }
    }

    return DEFAULT_CONFIG;
  }
}
