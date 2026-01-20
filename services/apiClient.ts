import { HttpError, NetworkError, buildUrl, fetchWithTimeout, parseResponse } from "./http";
import { CircuitOpenError, circuitBreakerRegistry } from "./resilience/circuitBreaker";
import { authSession, SessionExpiredError } from "./auth/sessionManager";
import { HttpMethod, NonGetHttpMethod } from "@/core/enums/http.enums";
import { getCachedValue, setCachedValue } from "./resilience/cache";
import { persistentRequestQueue } from "./resilience/requestQueue";
import { errorEmitter, offlineEmitter } from "./resilience/state";
import { networkMonitor } from "./resilience/networkMonitor";
import { trackRequestTelemetry } from "./telemetryService";
import Toast from "react-native-toast-message";

const REQUEST_TIMEOUT = 8000;
const MAX_RETRIES = 2;
const OFFLINE_MESSAGE = "Modo limitado: sin conexión";

const offlineState = { active: false };

const inFlightRequests = new Map<string, Promise<unknown>>();

function getRequestKey(endpoint: string, method: HttpMethod): string {
  return `${method}:${endpoint}`;
}

type RequestOrigin = "direct" | "queue";

export interface ResilientRequestOptions {
  endpoint: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  useCache?: boolean;
  requestId?: string;
  allowQueue?: boolean;
  origin?: RequestOrigin;
}

function setOffline(active: boolean): void {
  if (offlineState.active === active) {
    return;
  }
  offlineState.active = active;
  offlineEmitter.emit({ active });
}

function getServiceKey(endpoint: string): string {
  const clean = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const [service] = clean.split("/");
  return service || "root";
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt: number): number {
  const base = Math.pow(2, attempt - 1) * 400;
  const jitter = Math.random() * 300;
  return base + jitter;
}

function shouldQueueRequest(body: any, allowQueue: boolean | undefined): boolean {
  if (allowQueue === false) {
    return false;
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return false;
  }

  return true;
}

function createRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeBody(
  body: any,
  headers: Record<string, string>,
): { body: BodyInit | undefined; headers: Record<string, string> } {
  if (body === undefined || body === null) {
    return { body: undefined, headers };
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return { body, headers };
  }

  if (typeof body === "string") {
    return { body, headers };
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return { body: JSON.stringify(body), headers };
}

function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof HttpError) {
    return error.status >= 500;
  }

  return false;
}

function ensureRequestId(headers: Record<string, string>, requestId?: string): string {
  const id = requestId ?? createRequestId();
  headers["X-Request-Id"] = id;
  return id;
}

const AUTH_PUBLIC_PATHS = [
  /^\/auth\/login/i,
  /^\/auth\/register/i,
  /^\/auth\/refresh/i,
  /^\/locations(?:\/|$)/i,
];

function shouldAttachAuth(endpoint: string): boolean {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return !AUTH_PUBLIC_PATHS.some(pattern => pattern.test(normalized));
}

export async function resilientRequest<T>(options: ResilientRequestOptions): Promise<T> {
  const { endpoint, method } = options;
  const requestKey = getRequestKey(endpoint, method);

  if (method === "GET") {
    const existingRequest = inFlightRequests.get(requestKey);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
  }

  const requestPromise = executeRequest<T>(options);

  if (method === "GET") {
    inFlightRequests.set(requestKey, requestPromise);
    requestPromise.finally(() => {
      inFlightRequests.delete(requestKey);
    });
  }

  return requestPromise;
}

async function executeRequest<T>(options: ResilientRequestOptions): Promise<T> {
  const {
    endpoint,
    method,
    headers = {},
    body,
    timeout = REQUEST_TIMEOUT,
    useCache = method === "GET",
    requestId,
    allowQueue,
    origin = "direct",
  } = options;

  const breaker = circuitBreakerRegistry.getBreaker(getServiceKey(endpoint));
  const isCriticalMatching = endpoint.includes("/matching/");

  if (!isCriticalMatching && !breaker.canRequest()) {
    const message = "Servicio temporalmente inestable. Inténtalo más tarde.";
    errorEmitter.emit({ message });
    throw new CircuitOpenError(message);
  }

  const url = buildUrl(endpoint);
  const baseHeaders: Record<string, string> = { ...headers };

  let effectiveRequestId: string | undefined = requestId;
  let triedRefresh = false;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    const attemptStart = Date.now();
    try {
      const headersForAttempt: Record<string, string> = { ...baseHeaders };

      if (method !== "GET") {
        effectiveRequestId = ensureRequestId(headersForAttempt, effectiveRequestId);
      }

      const shouldAuthorize = shouldAttachAuth(endpoint);

      const { body: normalizedBody, headers: normalizedHeaders } = normalizeBody(
        body,
        headersForAttempt,
      );

      if (shouldAuthorize) {
        const token = await authSession.getAccessToken();
        if (token) {
          normalizedHeaders["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetchWithTimeout(
        url,
        {
          method,
          headers: normalizedHeaders,
          body: normalizedBody,
        },
        timeout,
      );

      if (response.status === 401 && shouldAuthorize) {
        await trackRequestTelemetry({
          endpoint,
          method,
          status: "error",
          statusCode: response.status,
          durationMs: Date.now() - attemptStart,
        });

        breaker.recordSuccess();

        if (triedRefresh) {
          await authSession.handleSessionExpired();
          throw new HttpError(401, "Sesión vencida, iniciá sesión de nuevo.", null);
        }

        triedRefresh = true;

        try {
          const refreshedToken = await authSession.refreshAccessToken();
          if (!refreshedToken) {
            await authSession.handleSessionExpired();
            throw new SessionExpiredError("Sesión vencida, iniciá sesión de nuevo.");
          }
        } catch (refreshError) {
          if (refreshError instanceof SessionExpiredError) {
            await authSession.handleSessionExpired();
            throw new HttpError(401, "Sesión vencida, iniciá sesión de nuevo.", null);
          }

          if (refreshError instanceof NetworkError) {
            throw refreshError;
          }

          lastError = refreshError;
          break;
        }

        continue;
      }

      const payload = await parseResponse(response);
      breaker.recordSuccess();
      setOffline(false);
      errorEmitter.emit(null);

      await trackRequestTelemetry({
        endpoint,
        method,
        status: "success",
        statusCode: response.status,
        durationMs: Date.now() - attemptStart,
      });

      if (useCache && method === "GET") {
        await setCachedValue(endpoint, payload);
      }

      return payload;
    } catch (error) {
      lastError = error;

      if (error instanceof SessionExpiredError) {
        await authSession.handleSessionExpired();
        throw new HttpError(401, "Sesión vencida, iniciá sesión de nuevo.", null);
      }

      // Global Interceptor: Trigger offline mode immediately on network failures
      if (error instanceof NetworkError) {
        networkMonitor.triggerOffline();
      }

      if (error instanceof HttpError) {
        if (error.status === 502 || error.status === 503) {
          networkMonitor.triggerOffline();
        }
      }

      const telemetryStatus = error instanceof NetworkError ? "timeout" : "error";
      await trackRequestTelemetry({
        endpoint,
        method,
        status: telemetryStatus,
        statusCode: error instanceof HttpError ? error.status : undefined,
        durationMs: Date.now() - attemptStart,
      });

      if (error instanceof HttpError) {
        if (error.status >= 500) {
          breaker.recordFailure();
        } else {
          breaker.recordSuccess();
          throw error;
        }
      } else {
        breaker.recordFailure();
      }

      if (attempt < MAX_RETRIES && isRetryable(error)) {
        attempt += 1;
        await delay(getBackoffDelay(attempt));
        continue;
      }

      break;
    }
  }

  if (method === "GET" && useCache) {
    const cached = await getCachedValue<T>(endpoint);
    if (cached !== null) {
      setOffline(true);
      errorEmitter.emit({ message: OFFLINE_MESSAGE });
      return cached;
    }
  }

  if (method !== "GET" && origin === "direct" && shouldQueueRequest(body, allowQueue)) {
    const headersForQueue: Record<string, string> = { ...baseHeaders };
    effectiveRequestId = ensureRequestId(headersForQueue, effectiveRequestId);

    const queueItemAdded = await persistentRequestQueue.enqueue({
      requestId: effectiveRequestId ?? createRequestId(),
      endpoint,
      method: method as NonGetHttpMethod,
      body,
      headers: headersForQueue,
    });

    if (queueItemAdded) {
      Toast.show({ type: "info", text1: "Acción guardada, se enviará luego." });
      setOffline(true);
      errorEmitter.emit({ message: OFFLINE_MESSAGE });
      return undefined as T;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new NetworkError();
}

export async function flushQueuedRequests(): Promise<void> {
  await persistentRequestQueue.flush(async item => {
    await resilientRequest({
      endpoint: item.endpoint,
      method: item.method,
      headers: item.headers,
      body: item.body,
      allowQueue: false,
      origin: "queue",
    });
  });
}
