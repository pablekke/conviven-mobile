import { buildUrl, fetchWithTimeout, parseResponse } from "../../../services/apiClient";
import AuthService from "../../../services/authService";

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
