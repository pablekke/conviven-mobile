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
  constructor(message: string = "No se pudo conectar con el servidor") {
    super(message);
    this.name = "NetworkError";
  }
}

export function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Hace un fetch con timeout. Si el servidor no responde en el tiempo especificado,
 * lanza un NetworkError
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeout: number = 10000,
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
      throw new NetworkError("El servidor no responde. Por favor, verifica tu conexión.");
    }
    if (error instanceof TypeError) {
      throw new NetworkError(
        "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      );
    }
    throw error;
  }
}

export async function parseResponse(response: Response): Promise<any> {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new NetworkError(
      "El servidor no está disponible en este momento. Por favor, intenta nuevamente más tarde.",
    );
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
    throw new NetworkError(
      "El servidor envió una respuesta inválida. Por favor, intenta nuevamente.",
    );
  }

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || `Request failed with status ${response.status}`;

    throw new HttpError(response.status, message, payload);
  }

  return payload;
}
