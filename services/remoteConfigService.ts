import AsyncStorage from "@react-native-async-storage/async-storage";

const REMOTE_CONFIG_KEY = "@resilience/remote-config";

export interface RemoteConfig {
  statusPageUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

const DEFAULT_CONFIG: RemoteConfig = {
  statusPageUrl: "",
  maintenanceMode: false,
  maintenanceMessage: undefined,
};

export async function loadRemoteConfig(): Promise<RemoteConfig> {
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
