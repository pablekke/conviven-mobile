import Toast from "react-native-toast-message";

import { API_BASE_URL } from "@/config/env";

import { trackRequestTelemetry } from "./telemetryService";
import { CircuitOpenError, circuitBreakerRegistry } from "./resilience/circuitBreaker";
import { getCachedValue, setCachedValue } from "./resilience/cache";
import { persistentRequestQueue } from "./resilience/requestQueue";
import { errorEmitter, offlineEmitter } from "./resilience/state";

export class HttpError extends Error {
  status: number;
  payload: any;

  constructor(status: number, message: string, payload: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class NetworkError extends Error {
  constructor(message: string = "No pudimos conectarnos") {
    super(message);
    this.name = "NetworkError";
  }
}

export function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

const REQUEST_TIMEOUT = 8000;
const MAX_RETRIES = 2;
const OFFLINE_MESSAGE = "Modo limitado: sin conexión";

const offlineState = { active: false };

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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

export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError();
    }
    if (error instanceof TypeError) {
      throw new NetworkError();
    }
    throw error;
  }
}

export async function parseResponse(response: Response): Promise<any> {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new NetworkError();
  }

  const contentType = response.headers.get("content-type");
  let payload: any = null;

  try {
    if (contentType?.includes("application/json")) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = text || null;
    }
  } catch (error) {
    throw new NetworkError();
  }

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "No pudimos conectarnos";

    throw new HttpError(response.status, message, payload);
  }

  return payload;
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

export async function resilientRequest<T>(options: ResilientRequestOptions): Promise<T> {
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

  if (!breaker.canRequest()) {
    const message = "Servicio temporalmente inestable. Inténtalo más tarde.";
    errorEmitter.emit({ message });
    throw new CircuitOpenError(message);
  }

  const url = buildUrl(endpoint);
  const finalHeaders: Record<string, string> = { ...headers };

  let effectiveRequestId: string | undefined = requestId;
  if (method !== "GET") {
    effectiveRequestId = ensureRequestId(finalHeaders, requestId);
  }

  const { body: normalizedBody, headers: normalizedHeaders } = normalizeBody(body, finalHeaders);

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    const attemptStart = Date.now();
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method,
          headers: normalizedHeaders,
          body: normalizedBody,
        },
        timeout,
      );

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
    const queueItemAdded = await persistentRequestQueue.enqueue({
      requestId: effectiveRequestId ?? createRequestId(),
      endpoint,
      method: method as "POST" | "PUT" | "PATCH" | "DELETE",
      body,
      headers: normalizedHeaders,
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
