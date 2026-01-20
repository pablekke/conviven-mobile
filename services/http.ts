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
  const contentType = response.headers.get("content-type");
  let payload: any = null;

  try {
    if (contentType?.includes("application/json")) {
      try {
        const text = await response.text();
        if (text) {
          payload = JSON.parse(text);
        }
      } catch (jsonError) {
        console.warn("⚠️ [HTTP] JSON Syntax Error:", jsonError);
        if (response.status >= 500) {
          throw new HttpError(response.status, "Error del servidor (Respuesta inválida)", null);
        }
        throw new NetworkError("Respuesta del servidor inválida");
      }
    } else {
      const text = await response.text();

      // Detectar si la respuesta es HTML (ngrok offline, error pages, etc)
      if (
        text.trim().toLowerCase().startsWith("<!doctype") ||
        text.trim().toLowerCase().startsWith("<html")
      ) {
        // Es una página HTML de error, no JSON (probablemente Ngrok landing o error)
        console.error("🔥 [HTTP] Respuesta HTML inesperada:", text.substring(0, 300));

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new HttpError(response.status, "El servidor no está disponible", null);
        }

        if (text.includes("ngrok") && text.includes("offline")) {
          throw new NetworkError("El servidor no está disponible en este momento (Ngrok Offline)");
        }
        throw new NetworkError("El servidor respondió con contenido inválido.");
      }

      payload = text || null;
    }
  } catch (error) {
    if (error instanceof NetworkError || error instanceof HttpError) {
      throw error;
    }
    throw new NetworkError("No se pudo leer la respuesta del servidor");
  }

  if (!response.ok) {
    let message: string = "Error del servidor";

    if (payload && typeof payload === "object") {
      message = payload.message || payload.error || "Error del servidor";
    } else if (typeof payload === "string") {
      message = payload;
    }

    throw new HttpError(response.status, message, payload);
  }

  return payload;
}
