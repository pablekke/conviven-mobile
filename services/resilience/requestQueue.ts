import AsyncStorage from "@react-native-async-storage/async-storage";

import { queueEmitter } from "./state";

const QUEUE_KEY = "@resilience/queue";

export interface QueuedRequest {
  requestId: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export type QueueSender = (item: QueuedRequest) => Promise<void>;

export class PersistentRequestQueue {
  private queue: QueuedRequest[] = [];
  private isLoaded = false;
  private isFlushing = false;

  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) {
      try {
        this.queue = JSON.parse(raw) as QueuedRequest[];
      } catch (error) {
        console.warn("queue:parse:error", error);
        this.queue = [];
      }
    }

    this.isLoaded = true;
    queueEmitter.emit({ pending: this.queue.length });
  }

  private async persist(): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  async size(): Promise<number> {
    await this.ensureLoaded();
    return this.queue.length;
  }

  async enqueue(item: QueuedRequest): Promise<boolean> {
    await this.ensureLoaded();

    if (this.queue.some(existing => existing.requestId === item.requestId)) {
      return false;
    }

    this.queue.push(item);
    await this.persist();
    queueEmitter.emit({ pending: this.queue.length });
    return true;
  }

  async flush(sender: QueueSender): Promise<void> {
    await this.ensureLoaded();

    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      const pending = [...this.queue];
      for (const item of pending) {
        try {
          await sender(item);
          this.queue = this.queue.filter(q => q.requestId !== item.requestId);
          await this.persist();
          queueEmitter.emit({ pending: this.queue.length });
        } catch (error) {
          console.warn("queue:flush:error", error);
          break;
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  async clear(): Promise<void> {
    await this.ensureLoaded();
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
    queueEmitter.emit({ pending: 0 });
  }

  async peek(): Promise<QueuedRequest[]> {
    await this.ensureLoaded();
    return [...this.queue];
  }
}

export const persistentRequestQueue = new PersistentRequestQueue();
