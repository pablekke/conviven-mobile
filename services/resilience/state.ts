type ResilienceListener<T> = (payload: T) => void;

type OfflineStatus = {
  active: boolean;
};

type MaintenanceStatus = {
  active: boolean;
  message?: string;
  statusPageUrl?: string;
};

type QueueStatus = {
  pending: number;
};

type ErrorStatus = {
  message: string;
};

class SimpleEmitter<T> {
  private listeners = new Set<ResilienceListener<T>>();

  subscribe(listener: ResilienceListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(payload: T): void {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }
}

export const offlineEmitter = new SimpleEmitter<OfflineStatus>();
export const maintenanceEmitter = new SimpleEmitter<MaintenanceStatus>();
export const queueEmitter = new SimpleEmitter<QueueStatus>();
export const errorEmitter = new SimpleEmitter<ErrorStatus | null>();
