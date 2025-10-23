import { resilientRequest } from "./apiClient";

/**
 * GET - Obtener recurso
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  
  return resilientRequest<T>({
    endpoint,
    method: "GET",
    useCache: true,
  });
}

/**
 * POST - Crear recurso
 */
export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: "POST",
    body,
    allowQueue: true,
  });
}

/**
 * PUT - Actualizar recurso completo
 */
export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: "PUT",
    body,
    allowQueue: true,
  });
}

/**
 * PATCH - Actualizar recurso parcial
 */
export async function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  return resilientRequest<T>({
    endpoint,
    method: "PATCH",
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
    method: "DELETE",
    allowQueue: true,
  });
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
  return resilientRequest<T>({
    endpoint,
    method,
    headers: options.headers,
    body: options.body,
    timeout: options.timeout,
    allowQueue: method !== "GET",
    useCache: method === "GET",
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
