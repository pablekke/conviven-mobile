import { resilientRequest } from "./apiClient";
import { City, Department, Neighborhood } from "@/types/user";
import { API } from "@/constants";
import { HttpMethod } from "@/core/enums/http.enums";

function resolveMethod(method?: string | null): HttpMethod {
  if (!method) {
    return HttpMethod.GET;
  }

  const normalized = method.toUpperCase() as keyof typeof HttpMethod;

  if (normalized in HttpMethod) {
    return HttpMethod[normalized];
  }

  return HttpMethod.GET;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  const method = resolveMethod(options.method);
  let body: any = options.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = options.body;
    }
  }

  return resilientRequest({
    endpoint: path,
    method,
    headers,
    body,
    allowQueue: method !== HttpMethod.GET,
    useCache: method === HttpMethod.GET,
  });
}

function mapDepartment(data: any): Department {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid department payload");
  }

  return {
    id: String(data.id ?? data.uuid ?? ""),
    name: String(data.name ?? ""),
  };
}

function mapCity(data: any): City {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid city payload");
  }

  const departmentRaw = data.department ?? data.departmentInfo ?? data.departmentData;

  return {
    id: String(data.id ?? data.uuid ?? ""),
    name: String(data.name ?? ""),
    departmentId: String(data.departmentId ?? data.department_id ?? departmentRaw?.id ?? ""),
    department: departmentRaw ? mapDepartment(departmentRaw) : undefined,
  };
}

function mapNeighborhood(data: any): Neighborhood {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid neighborhood payload");
  }

  const cityRaw = data.city ?? data.cityInfo ?? data.cityData;

  return {
    id: String(data.id ?? data.uuid ?? ""),
    name: String(data.name ?? ""),
    cityId: String(data.cityId ?? data.city_id ?? cityRaw?.id ?? ""),
    city: cityRaw ? mapCity(cityRaw) : undefined,
  };
}

const LocationService = {
  async listDepartments(): Promise<Department[]> {
    const data = await request(`${API.DEPARTMENTS}?page=1&limit=200`);
    const departmentsArray = Array.isArray(data) ? data : (data?.data ?? []);
    return departmentsArray.map(mapDepartment);
  },

  async getDepartment(id: string): Promise<Department> {
    const data = await request(API.DEPARTMENT_BY_ID(id));
    return mapDepartment(data?.department ?? data);
  },

  async listCities(departmentId?: string): Promise<City[]> {
    const url = departmentId ? API.CITIES_BY_DEPT(departmentId) : API.CITIES;
    const data = await request(url);
    const citiesArray = Array.isArray(data) ? data : (data?.data ?? []);
    return citiesArray.map(mapCity);
  },

  async getCity(id: string): Promise<City> {
    const data = await request(API.CITY_BY_ID(id));
    return mapCity(data?.city ?? data);
  },

  async listNeighborhoods(cityId?: string): Promise<Neighborhood[]> {
    const url = cityId ? API.NEIGHBORHOODS_BY_CITY(cityId) : API.NEIGHBORHOODS;
    const data = await request(url);
    const neighborhoodsArray = Array.isArray(data) ? data : (data?.data ?? []);
    return neighborhoodsArray.map(mapNeighborhood);
  },

  async getNeighborhood(id: string): Promise<Neighborhood> {
    const data = await request(API.NEIGHBORHOOD_BY_ID(id));
    return mapNeighborhood(data?.neighborhood ?? data);
  },
};

export default LocationService;
