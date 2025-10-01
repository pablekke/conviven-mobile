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

export function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  let payload: any = null;

  if (contentType?.includes("application/json")) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text || null;
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
