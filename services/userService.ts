import AuthService from "./authService";
import { resilientRequest } from "./apiClient";
import { mapUserFromApi } from "./mappers/userMapper";
import { API } from "@/constants";
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

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function authorizedRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = await AuthService.getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const method = (options.method ?? "GET") as HttpMethod;
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
    allowQueue: method !== "GET",
    useCache: method === "GET",
  });
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

    const data = await resilientRequest<any>({
      endpoint: "/users/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: registerPayload,
      allowQueue: false,
    });
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async registerWithRole(
    role: "user" | "provider" | "admin",
    payload: AdminRegisterPayload,
  ): Promise<User> {
    const normalizedRole = role.toLowerCase();
    const data = await authorizedRequest(API.USER_REGISTER(normalizedRole), {
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
    const data = await authorizedRequest(`${API.USERS}${queryString}`);

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
    const data = await authorizedRequest(API.USER_PROFILE);
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async deleteCurrent(): Promise<void> {
    await authorizedRequest(API.USER_DELETE, {
      method: "DELETE",
    });
  },

  async getById(id: string): Promise<User> {
    const data = await authorizedRequest(API.USER_BY_ID(id));
    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const body: Record<string, unknown> = { ...payload };

    const data = await authorizedRequest(API.USER_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async updateAvatar(
    id: string,
    asset: { uri: string; name?: string; type?: string },
  ): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", {
      uri: asset.uri,
      name: asset.name ?? `avatar-${Date.now()}.jpg`,
      type: asset.type ?? "image/jpeg",
    } as any);

    const data = await authorizedRequest(`${API.USER_BY_ID(id)}/avatar`, {
      method: "PUT",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const userPayload = extractUserPayload(data);
    return mapUserFromApi(userPayload);
  },

  async remove(id: string): Promise<void> {
    await authorizedRequest(API.USER_BY_ID(id), {
      method: "DELETE",
    });
  },

  async changeRole(id: string, role: UserRole): Promise<User> {
    const data = await authorizedRequest(`${API.USER_BY_ID(id)}/role`, {
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
