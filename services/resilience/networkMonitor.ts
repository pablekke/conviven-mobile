import { AppState, AppStateStatus } from "react-native";
import { API_ROOT } from "@/config/env";

const CHECK_INTERVAL = 15000;

export type NetworkStatusListener = (isOnline: boolean) => void;

class NetworkMonitor {
  private listeners = new Set<NetworkStatusListener>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentState: boolean = true;
  private appState: AppStateStatus = AppState.currentState;

  constructor() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    this.appState = nextAppState;
    if (nextAppState === "active") {
      this.checkNow().catch(error => console.warn("network-monitor:check:error", error));
    }
  };

  private start(): void {
    if (this.intervalId) {
      return;
    }

    this.checkNow().catch(error => console.warn("network-monitor:check:error", error));
    this.intervalId = setInterval(() => {
      if (this.appState === "active") {
        this.checkNow().catch(error => console.warn("network-monitor:check:error", error));
      }
    }, CHECK_INTERVAL);
  }

  private stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    this.start();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  private async checkNow(): Promise<void> {
    const online = await this.ping();
    if (online !== this.currentState) {
      this.currentState = online;
      this.emit();
    }
  }

  public async checkConnection(): Promise<boolean> {
    return this.ping();
  }

  public triggerOffline(): void {
    if (this.currentState) {
      this.currentState = false;
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }

  private async ping(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout

    try {
      await fetch(`${API_ROOT}/health`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      // If we get any response from the server, we are connected.
      // Even 500s mean we reached the server.
      // Only network errors throw.
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("network-monitor:ping:failed", error);
      return false;
    }
  }
}

export const networkMonitor = new NetworkMonitor();
