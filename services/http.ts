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
    const headers = new Headers(options?.headers);
    headers.set("ngrok-skip-browser-warning", "true");

    const response = await fetch(url, {
      ...options,
      headers,
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
      console.error("❌ [HTTP] Fetch Error:", error.message, "URL:", url);
      throw new NetworkError(`Error de conexión: ${error.message}`);
    }
    throw error;
  }
}

export async function parseResponse(response: Response): Promise<any> {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new NetworkError("El servidor no está disponible");
  }

  const contentType = response.headers.get("content-type");
  let payload: any = null;

  try {
    if (contentType?.includes("application/json")) {
      payload = await response.json();
    } else {
      const text = await response.text();

      // Detectar si la respuesta es HTML (ngrok offline, error pages, etc)
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        // Es una página HTML de error, no JSON (probablemente Ngrok landing o error)
        console.error("🔥 [HTTP] Respuesta HTML inesperada:", text.substring(0, 300));

        if (text.includes("ngrok") && text.includes("offline")) {
          throw new NetworkError("El servidor no está disponible en este momento (Ngrok Offline)");
        }
        throw new NetworkError(
          "El servidor respondió con HTML. Revisa los logs para ver el mensaje.",
        );
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
      message =
        typeof payload === "string"
          ? payload
          : payload?.message || payload?.error || "Error del servidor";
    }

    throw new HttpError(response.status, message, payload);
  }

  return payload;
}
