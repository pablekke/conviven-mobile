import { API_BASE_URL } from "@/config/env";

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
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

export async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new NetworkError("El servidor no está disponible");
  }

  const contentType = response.headers.get("content-type");
  let payload: unknown = null;

  try {
    if (contentType?.includes("application/json")) {
      payload = await response.json();
    } else {
      const text = await response.text();

      // Detectar si la respuesta es HTML (ngrok offline, error pages, etc)
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        // Es una página HTML de error, no JSON
        if (text.includes("ngrok") && text.includes("offline")) {
          throw new NetworkError("El servidor no está disponible en este momento");
        }
        throw new NetworkError("El servidor no está disponible");
      }

      payload = text || null;
    }
  } catch (error) {
    // Si ya es un NetworkError, re-lanzarlo
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError("Error de conexión");
  }

  if (!response.ok) {
    // Si el payload es HTML, no mostrarlo al usuario
    let message: string;

    if (
      typeof payload === "string" &&
      (payload.includes("<!DOCTYPE") || payload.includes("<html"))
    ) {
      message = "El servidor no está disponible";
    } else {
      const payloadAsAny = payload as any;
      message =
        typeof payload === "string"
          ? payload
          : payloadAsAny?.message || payloadAsAny?.error || "Error del servidor";
    }

    throw new HttpError(response.status, message, payload);
  }

  return payload;
}
