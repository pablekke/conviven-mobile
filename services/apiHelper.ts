import { buildUrl, fetchWithTimeout, parseResponse } from "./apiClient";
import AuthService from "./authService";

/**
 * Obtiene los headers comunes con autenticación
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await AuthService.getAccessToken();

  if (!token) {
    throw new Error("No autenticado");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * GET - Obtener recurso
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchWithTimeout(buildUrl(endpoint), {
    method: "GET",
    headers,
  });

  return parseResponse(response);
}

/**
 * POST - Crear recurso
 */
export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchWithTimeout(buildUrl(endpoint), {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

/**
 * PUT - Actualizar recurso completo
 */
export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchWithTimeout(buildUrl(endpoint), {
    method: "PUT",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

/**
 * PATCH - Actualizar recurso parcial
 */
export async function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchWithTimeout(buildUrl(endpoint), {
    method: "PATCH",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

/**
 * DELETE - Eliminar recurso
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchWithTimeout(buildUrl(endpoint), {
    method: "DELETE",
    headers,
  });

  return parseResponse(response);
}

/**
 * Función genérica para hacer cualquier tipo de petición HTTP autenticada
 * Útil cuando necesitas más control sobre la petición
 */
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  options: {
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
  } = {},
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const finalHeaders = {
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetchWithTimeout(
    buildUrl(endpoint),
    {
      method,
      headers: finalHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    },
    options.timeout,
  );

  return parseResponse(response);
}

/**
 * Clase base para servicios API que proporciona métodos comunes
 * Los servicios pueden extender esta clase para obtener funcionalidad básica
 */
export class BaseApiService {
  protected baseEndpoint: string;

  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint;
  }

  protected buildEndpoint(path: string = ""): string {
    return path ? `${this.baseEndpoint}/${path}` : this.baseEndpoint;
  }

  /**
   * GET - Obtener recurso(s)
   */
  protected async get<T>(path: string = ""): Promise<T> {
    return apiGet<T>(this.buildEndpoint(path));
  }

  /**
   * POST - Crear recurso
   */
  protected async post<T>(path: string = "", body?: any): Promise<T> {
    return apiPost<T>(this.buildEndpoint(path), body);
  }

  /**
   * PUT - Actualizar recurso completo
   */
  protected async put<T>(path: string = "", body?: any): Promise<T> {
    return apiPut<T>(this.buildEndpoint(path), body);
  }

  /**
   * PATCH - Actualizar recurso parcial
   */
  protected async patch<T>(path: string = "", body?: any): Promise<T> {
    return apiPatch<T>(this.buildEndpoint(path), body);
  }

  /**
   * DELETE - Eliminar recurso
   */
  protected async delete<T>(path: string = ""): Promise<T> {
    return apiDelete<T>(this.buildEndpoint(path));
  }
}

// Exportar también las funciones individuales para compatibilidad
export {
  apiGet as get,
  apiPost as post,
  apiPut as put,
  apiPatch as patch,
  apiDelete as del,
  apiRequest as request,
};
