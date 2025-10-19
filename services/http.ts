import { API_BASE_URL } from "@/config/env";

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
  constructor(message: string = "Sin conexión") {
    super(message);
    this.name = "NetworkError";
  }
}

export function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

const REQUEST_TIMEOUT = 8000;

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
        : payload?.message || payload?.error || "Sin conexión";

    throw new HttpError(response.status, message, payload);
  }

  return payload;
}

