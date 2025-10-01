export const API_BASE_URL = "https://conviven-backend.onrender.com/api";
// export const API_BASE_URL = "http://localhost:4000/api";

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  let payload: unknown = null;

  if (contentType?.includes("application/json")) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text || null;
  }

  if (!response.ok) {
    const errorPayload = payload as { message?: string; error?: string } | null;
    const message =
      typeof payload === "string"
        ? payload
        : errorPayload?.message ??
          errorPayload?.error ??
          `Request failed with status ${response.status}`;

    throw new HttpError(response.status, message, payload);
  }

  return payload as T;
}
