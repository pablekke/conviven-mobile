export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type QueryParams = Record<string, QueryParamValue>;

export type ApiRequestConfig<TBody = unknown> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: QueryParams;
  body?: TBody;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ApiRequestOptions<TBody = unknown> = ApiRequestConfig<TBody> & {
  path: string;
};

export type ApiResponse<TData> = {
  data: TData;
  status: number;
};

export type ApiUnauthorizedHandler = () => void | Promise<void>;

export class ApiError<TError = unknown> extends Error {
  readonly status: number;
  readonly data: TError | null;
  readonly path: string;
  readonly method: HttpMethod;

  constructor({
    message,
    status,
    data,
    path,
    method,
  }: {
    message: string;
    status: number;
    data: TError | null;
    path: string;
    method: HttpMethod;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.path = path;
    this.method = method;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;
