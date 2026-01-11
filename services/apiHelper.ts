import { resilientRequest } from "./apiClient";
import { HttpMethod } from "@/core/enums/http.enums";

/**
 * GET - Obtener recurso
 */
export async function apiGet<T>(
  endpoint: string,
  options?: { timeout?: number; useCache?: boolean },
): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: HttpMethod.GET,
    useCache: options?.useCache ?? true,
    timeout: options?.timeout,
  });
}

/**
 * POST - Crear recurso
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: HttpMethod.POST,
    body,
    allowQueue: true,
  });
}

/**
 * PUT - Actualizar recurso completo
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: HttpMethod.PUT,
    body,
    allowQueue: true,
  });
}

/**
 * PATCH - Actualizar recurso parcial
 */
export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: HttpMethod.PATCH,
    body,
    allowQueue: true,
  });
}

/**
 * DELETE - Eliminar recurso
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: HttpMethod.DELETE,
    allowQueue: true,
  });
}

/**
 * Función genérica para hacer cualquier tipo de petición HTTP autenticada
 * Útil cuando necesitas más control sobre la petición
 */
export async function apiRequest<T>(
  endpoint: string,
  method: HttpMethod,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
  } = {},
): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method,
    headers: options.headers,
    body: options.body,
    timeout: options.timeout,
    allowQueue: method !== HttpMethod.GET,
    useCache: method === HttpMethod.GET,
  });
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
  protected async get<T>(path: string = "", options?: { timeout?: number }): Promise<T> {
    return apiGet<T>(this.buildEndpoint(path), options);
  }

  /**
   * POST - Crear recurso
   */
  protected async post<T>(path: string = "", body?: unknown): Promise<T> {
    return apiPost<T>(this.buildEndpoint(path), body);
  }

  /**
   * PUT - Actualizar recurso completo
   */
  protected async put<T>(path: string = "", body?: unknown): Promise<T> {
    return apiPut<T>(this.buildEndpoint(path), body);
  }

  /**
   * PATCH - Actualizar recurso parcial
   */
  protected async patch<T>(path: string = "", body?: unknown): Promise<T> {
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
