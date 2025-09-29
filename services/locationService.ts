import { City, Department, Neighborhood } from "../types/location";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://conviven-backend.onrender.com/api";

interface RequestOptions {
  signal?: AbortSignal;
}

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal ?? controller?.signal;

  const timeout = controller
    ? setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, 15000)
    : null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { signal: signal ?? undefined });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "string"
          ? payload || `Request failed with status ${response.status}`
          : payload?.message || payload?.error || `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return payload;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function ensureArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data.items)) {
      return data.items;
    }

    if (Array.isArray(data.results)) {
      return data.results;
    }

    if (Array.isArray(data.content)) {
      return data.content;
    }

    if (data.data && typeof data.data === "object") {
      const nested = ensureArray(data.data);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function mapLocation<T extends { id: string; name: string }>(item: any): T | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const id = String(item.id ?? item._id ?? item.value ?? item.code ?? "").trim();
  const name = String(item.name ?? item.title ?? item.label ?? "").trim();

  if (!id || !name) {
    return null;
  }

  const base: any = { id, name };

  if (item.departmentId || item.department?.id) {
    base.departmentId = String(item.departmentId ?? item.department?.id);
  }

  if (item.cityId || item.city?.id) {
    base.cityId = String(item.cityId ?? item.city?.id);
  }

  return base as T;
}

export async function getDepartments(options?: RequestOptions): Promise<Department[]> {
  const payload = await request("/locations/departments?page=1&limit=200", options);
  const list = ensureArray(payload);
  return list
    .map(item => mapLocation<Department>(item))
    .filter((item): item is Department => Boolean(item));
}

export async function getCitiesByDepartment(
  departmentId: string,
  options?: RequestOptions,
): Promise<City[]> {
  if (!departmentId) {
    return [];
  }

  const payload = await request(`/locations/cities?departmentId=${encodeURIComponent(departmentId)}`, options);
  const list = ensureArray(payload);
  return list
    .map(item => mapLocation<City>(item))
    .filter((item): item is City => Boolean(item));
}

export async function getNeighborhoodsByCity(cityId: string, options?: RequestOptions): Promise<Neighborhood[]> {
  if (!cityId) {
    return [];
  }

  const payload = await request(`/locations/neighborhoods?cityId=${encodeURIComponent(cityId)}`, options);
  const list = ensureArray(payload);
  return list
    .map(item => mapLocation<Neighborhood>(item))
    .filter((item): item is Neighborhood => Boolean(item));
}
