import AuthService from "./authService";
import { buildUrl, parseResponse } from "./apiClient";
import { mapUserFromApi } from "./mappers/userMapper";
import {
  AdminRegisterPayload,
  PaginatedUsersResponse,
  PublicRegisterPayload,
  UpdateUserPayload,
  User,
  UserListQuery,
  UserRole,
} from "@/types/user";

function buildQueryString(params: UserListQuery = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function authorizedRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = await AuthService.getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  return parseResponse(response);
}

function extractUserPayload(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  return data.user || data.data?.user || data.data || data;
}

const UserService = {
  async register(payload: PublicRegisterPayload): Promise<User> {
    const registerPayload = {
      ...payload,
      role: payload.role ?? UserRole.USER,
    };

    const response = await fetch(buildUrl("/users/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerPayload),
    });

    const data = await parseResponse(response);
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async registerWithRole(role: "user" | "provider" | "admin", payload: AdminRegisterPayload): Promise<User> {
    const normalizedRole = role.toLowerCase();
    const data = await authorizedRequest(`/users/register/${normalizedRole}`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async list(params: UserListQuery = {}): Promise<PaginatedUsersResponse> {
    const queryString = buildQueryString(params);
    const data = await authorizedRequest(`/users${queryString}`);

    const usersData = Array.isArray(data.users) ? data.users : [];
    const users = usersData.map(mapUserFromApi);

    const pagination = data.pagination || {
      page: params.page ?? 1,
      limit: params.limit ?? users.length,
      total: users.length,
      totalPages: 1,
    };

    return {
      users,
      pagination,
    };
  },

  async getCurrent(): Promise<User> {
    const data = await authorizedRequest("/users/me");
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async deleteCurrent(): Promise<void> {
    await authorizedRequest("/users/me", {
      method: "DELETE",
    });
  },

  async getById(id: string): Promise<User> {
    const data = await authorizedRequest(`/users/${id}`);
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const body: Record<string, unknown> = { ...payload };

    const data = await authorizedRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async remove(id: string): Promise<void> {
    await authorizedRequest(`/users/${id}`, {
      method: "DELETE",
    });
  },

  async changeRole(id: string, role: UserRole): Promise<User> {
    const data = await authorizedRequest(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },
};

export default UserService;
