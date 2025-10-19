import Constants from "expo-constants";

type TelemetryStatus = "success" | "error" | "timeout";

export interface RequestTelemetry {
  endpoint: string;
  method: string;
  status: TelemetryStatus;
  statusCode?: number;
  durationMs: number;
}

export async function trackRequestTelemetry(payload: RequestTelemetry): Promise<void> {
  try {
    const connection = (globalThis.navigator as any)?.connection;
    const connectionType = connection?.type ?? connection?.effectiveType;
    const networkType = connectionType === "wifi" ? "wifi" : connectionType === "cellular" ? "datos" : "desconocida";
    const appVersion = Constants.expoConfig?.version ?? "dev";

    const telemetryRecord = {
      ...payload,
      network: networkType,
      appVersion,
      timestamp: new Date().toISOString(),
    };

    console.info("telemetry:request", telemetryRecord);
  } catch (error) {
    console.warn("telemetry:error", error);
  }
}
