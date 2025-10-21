import * as SecureStore from "expo-secure-store";

import { API } from "@/constants";

import { HttpError, NetworkError, buildUrl, fetchWithTimeout, parseResponse } from "../http";
import { offlineEmitter } from "../resilience/state";
import { extractAccessToken, extractRefreshToken } from "./tokenUtils";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const REFRESH_TIMEOUT = 8000;

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class SessionExpiredError extends Error {
  constructor(message: string = "Sesión vencida, iniciá sesión de nuevo.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

type AuthSessionEvent = { type: "sessionExpired" };

export class AuthSessionManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private initialized = false;
  private refreshPromise: Promise<string | null> | null = null;
  private offline = false;
  private listeners = new Set<(event: AuthSessionEvent) => void>();

  constructor() {
    offlineEmitter.subscribe(({ active }) => {
      this.offline = active;
    });
  }

  subscribe(listener: (event: AuthSessionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async getAccessToken(): Promise<string | null> {
    await this.ensureInitialized();
    return this.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    await this.ensureInitialized();
    return this.refreshToken;
  }

  async hasSession(): Promise<boolean> {
    await this.ensureInitialized();
    return Boolean(this.accessToken ?? this.refreshToken);
  }

  async setTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
    this.initialized = true;
    this.accessToken = accessToken;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, SECURE_OPTIONS);

    if (refreshToken !== undefined) {
      if (refreshToken) {
        this.refreshToken = refreshToken;
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, SECURE_OPTIONS);
      } else {
        this.refreshToken = null;
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    }
  }

  async clearTokens(): Promise<void> {
    this.initialized = true;
    this.accessToken = null;
    this.refreshToken = null;
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }

  async handleSessionExpired(): Promise<void> {
    await this.clearTokens();
    this.emit({ type: "sessionExpired" });
  }

  async refreshAccessToken(): Promise<string | null> {
    await this.ensureInitialized();

    if (this.offline) {
      throw new NetworkError();
    }

    if (!this.refreshToken) {
      return null;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh(this.refreshToken).finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async performRefresh(currentRefreshToken: string): Promise<string | null> {
    const url = buildUrl(API.REFRESH);

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        },
        REFRESH_TIMEOUT,
      );

      if (response.status === 401) {
        throw new SessionExpiredError();
      }

      let payload: any;

      try {
        payload = await parseResponse(response);
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          throw new SessionExpiredError();
        }
        throw error;
      }

      const newAccessToken = extractAccessToken(payload);
      const newRefreshToken = extractRefreshToken(payload) ?? currentRefreshToken;

      if (!newAccessToken) {
        throw new Error("No se pudo renovar la sesión");
      }

      await this.setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        throw error;
      }

      if (error instanceof NetworkError) {
        throw error;
      }

      if (error instanceof HttpError) {
        if (error.status === 401) {
          throw new SessionExpiredError();
        }
        if (error.status >= 500) {
          throw new NetworkError();
        }
      }

      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const [storedAccess, storedRefresh] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    this.accessToken = storedAccess ?? null;
    this.refreshToken = storedRefresh ?? null;
    this.initialized = true;
  }

  private emit(event: AuthSessionEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const authSession = new AuthSessionManager();

