import {
  API_BASE_URL,
  API_DEFAULT_TIMEOUT_MS,
} from "@/src/core/api/config";
import {
  ApiError,
  type ApiRequestConfig,
  type ApiRequestOptions,
  type ApiResponse,
  type ApiUnauthorizedHandler,
  type HttpMethod,
  type QueryParams,
} from "@/src/core/api/types";

const JSON_CONTENT_TYPE = "application/json";

const isSerializableBody = (body: unknown) => {
  if (body === null || typeof body !== "object") {
    return false;
  }

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  const isArrayBuffer =
    typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
  const isUrlSearchParams =
    typeof URLSearchParams !== "undefined" &&
    body instanceof URLSearchParams;

  return !isFormData && !isBlob && !isArrayBuffer && !isUrlSearchParams;
};

const normalizeQueryValue = (
  value: QueryParams[keyof QueryParams]
): Array<string> => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number | boolean =>
        ["string", "number", "boolean"].includes(typeof item)
      )
      .map((item) => String(item));
  }

  if (value === null || value === undefined) {
    return [];
  }

  if (["string", "number", "boolean"].includes(typeof value)) {
    return [String(value)];
  }

  return [];
};

const buildQueryString = (query?: QueryParams) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, rawValue]) => {
    const values = normalizeQueryValue(rawValue);

    values.forEach((value) => {
      params.append(key, value);
    });
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
};

const mergeHeaders = (
  base: Headers,
  override?: Record<string, string>
): Headers => {
  const headers = new Headers(base);

  if (override) {
    Object.entries(override).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  return headers;
};

const resolveMessage = (status: number) => {
  if (status >= 500) {
    return "El servidor no responde. Intentá nuevamente en unos minutos.";
  }

  if (status === 404) {
    return "No encontramos la información solicitada.";
  }

  if (status === 401) {
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  }

  if (status === 400) {
    return "Verificá los datos enviados.";
  }

  return "Ocurrió un error inesperado al comunicarse con el servidor.";
};

class ApiClient {
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private unauthorizedHandler: ApiUnauthorizedHandler | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setUnauthorizedHandler(handler: ApiUnauthorizedHandler | null) {
    this.unauthorizedHandler = handler;
  }

  async request<TResponse = unknown, TBody = unknown>({
    path,
    method = "GET",
    headers,
    body,
    query,
    signal,
    timeoutMs = API_DEFAULT_TIMEOUT_MS,
  }: ApiRequestOptions<TBody>): Promise<ApiResponse<TResponse>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const requestSignal = signal
      ? this.mergeSignals(signal, controller.signal)
      : controller.signal;

    try {
      const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}${buildQueryString(query)}`;

      const defaultHeaders = new Headers({
        Accept: JSON_CONTENT_TYPE,
      });

      if (this.accessToken) {
        defaultHeaders.set("Authorization", `Bearer ${this.accessToken}`);
      }

      const finalHeaders = mergeHeaders(defaultHeaders, headers);

      const init: RequestInit = {
        method,
        headers: finalHeaders,
        signal: requestSignal,
      };

      if (body !== undefined && body !== null) {
        if (isSerializableBody(body)) {
          finalHeaders.set("Content-Type", JSON_CONTENT_TYPE);
          init.body = JSON.stringify(body);
        } else {
          init.body = body as BodyInit;
        }
      }

      const response = await fetch(url, init);
      const resolvedResponse = await this.parseResponse<TResponse>(
        response,
        path,
        method
      );

      return resolvedResponse;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError({
          status: 408,
          data: null,
          method,
          path,
          message:
            "La solicitud tardó demasiado. Reintentá cuando tengas mejor conexión.",
        });
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        status: 0,
        data: null,
        method,
        path,
        message:
          "No pudimos conectar con el servidor. Revisá tu conexión a internet.",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<TResponse = unknown>(
    path: string,
    config: ApiRequestConfig | undefined = undefined
  ) {
    return this.request<TResponse>({
      ...config,
      path,
      method: "GET",
    });
  }

  async post<TResponse = unknown, TBody = unknown>(
    path: string,
    config: ApiRequestConfig<TBody> | undefined = undefined
  ) {
    return this.request<TResponse, TBody>({
      ...config,
      path,
      method: "POST",
    });
  }

  async put<TResponse = unknown, TBody = unknown>(
    path: string,
    config: ApiRequestConfig<TBody> | undefined = undefined
  ) {
    return this.request<TResponse, TBody>({
      ...config,
      path,
      method: "PUT",
    });
  }

  async patch<TResponse = unknown, TBody = unknown>(
    path: string,
    config: ApiRequestConfig<TBody> | undefined = undefined
  ) {
    return this.request<TResponse, TBody>({
      ...config,
      path,
      method: "PATCH",
    });
  }

  async delete<TResponse = unknown, TBody = unknown>(
    path: string,
    config: ApiRequestConfig<TBody> | undefined = undefined
  ) {
    return this.request<TResponse, TBody>({
      ...config,
      path,
      method: "DELETE",
    });
  }

  private mergeSignals(signalA: AbortSignal, signalB: AbortSignal) {
    const controller = new AbortController();

    const abort = (signal: AbortSignal) => {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener(
          "abort",
          () => {
            controller.abort(signal.reason);
          },
          { once: true }
        );
      }
    };

    abort(signalA);
    abort(signalB);

    return controller.signal;
  }

  private async parseResponse<TResponse>(
    response: Response,
    path: string,
    method: HttpMethod
  ): Promise<ApiResponse<TResponse>> {
    let payload: TResponse | null = null;
    const contentType = response.headers.get("Content-Type");
    const hasBody = response.status !== 204 && response.status !== 205;

    if (hasBody) {
      if (contentType && contentType.includes("application/json")) {
        payload = (await response.json()) as TResponse;
      } else {
        const text = await response.text();
        payload = text as TResponse;
      }
    }

    if (!response.ok) {
      if (response.status === 401 && this.unauthorizedHandler) {
        try {
          await this.unauthorizedHandler();
        } catch (handlerError) {
          console.warn("Error ejecutando el handler de sesión expirada", handlerError);
        }
      }

      throw new ApiError({
        status: response.status,
        data: payload,
        path,
        method,
        message: resolveMessage(response.status),
      });
    }

    return {
      data: payload as TResponse,
      status: response.status,
    };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
