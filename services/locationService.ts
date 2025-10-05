import AuthService from "./authService";
import { buildUrl, parseResponse } from "./apiClient";
import { City, Department, Neighborhood } from "@/types/user";

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = await AuthService.getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  return parseResponse(response);
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
    const data = await request("/departments");
    const departmentsArray = Array.isArray(data) ? data : data?.data ?? [];
    return departmentsArray.map(mapDepartment);
  },

  async getDepartment(id: string): Promise<Department> {
    const data = await request(`/departments/${id}`);
    return mapDepartment(data?.department ?? data);
  },

  async listCities(departmentId?: string): Promise<City[]> {
    const data = await request("/cities");
    const citiesArray = Array.isArray(data) ? data : data?.data ?? [];
    const cities = citiesArray.map(mapCity);
    if (!departmentId) {
      return cities;
    }
    return cities.filter(city => city.departmentId === departmentId);
  },

  async getCity(id: string): Promise<City> {
    const data = await request(`/cities/${id}`);
    return mapCity(data?.city ?? data);
  },

  async listNeighborhoods(cityId?: string): Promise<Neighborhood[]> {
    const data = await request("/neighborhoods");
    const neighborhoodsArray = Array.isArray(data) ? data : data?.data ?? [];
    const neighborhoods = neighborhoodsArray.map(mapNeighborhood);
    if (!cityId) {
      return neighborhoods;
    }
    return neighborhoods.filter(neighborhood => neighborhood.cityId === cityId);
  },

  async getNeighborhood(id: string): Promise<Neighborhood> {
    const data = await request(`/neighborhoods/${id}`);
    return mapNeighborhood(data?.neighborhood ?? data);
  },
};

export default LocationService;
