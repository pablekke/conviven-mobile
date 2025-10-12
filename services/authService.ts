import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, LoginCredentials, RegisterCredentials } from "@/types/user";
import { mapUserFromApi } from "./mappers/userMapper";
import { buildUrl, parseResponse, HttpError, fetchWithTimeout } from "./apiClient";
import { API } from "@/constants";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

function extractToken(data: any): string | null {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data !== "object") {
    return null;
  }

  const possibleToken =
    data.token ||
    data.accessToken ||
    data.access_token ||
    data.jwt ||
    data.idToken ||
    data.authToken;

  if (typeof possibleToken === "string") {
    return possibleToken;
  }

  const tokensContainer =
    data.tokens || data.tokenData || data.credentials || data.session || data.data?.tokens;

  if (tokensContainer) {
    const nestedToken = extractToken(tokensContainer);
    if (nestedToken) {
      return nestedToken;
    }

    if (typeof tokensContainer === "object") {
      const accessToken =
        tokensContainer.accessToken ||
        tokensContainer.access_token ||
        tokensContainer.access?.token ||
        tokensContainer.access?.accessToken;

      if (typeof accessToken === "string") {
        return accessToken;
      }
    }
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const token = extractToken(item);
      if (token) {
        return token;
      }
    }
  }

  if (data.data) {
    return extractToken(data.data);
  }

  return null;
}

async function persistUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

async function persistTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);

  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const storedRefreshToken = await getRefreshToken();

  if (!storedRefreshToken) {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }

  const response = await fetchWithTimeout(buildUrl(API.REFRESH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });

  const data = await parseResponse(response);
  const newAccessToken = extractToken(data);
  const newRefreshToken = extractRefreshToken(data) ?? storedRefreshToken;

  if (!newAccessToken) {
    throw new Error("No se recibió un nuevo token de acceso al refrescar la sesión");
  }

  await persistTokens(newAccessToken, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

function extractRefreshToken(data: any): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const possibleRefreshToken =
    data.refreshToken ||
    data.refresh_token ||
    data.refresh?.token ||
    data.tokens?.refreshToken ||
    data.data?.refreshToken;

  if (typeof possibleRefreshToken === "string") {
    return possibleRefreshToken;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const token = extractRefreshToken(item);
      if (token) {
        return token;
      }
    }
  }

  if (data.data) {
    return extractRefreshToken(data.data);
  }

  return null;
}

export default class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetchWithTimeout(buildUrl(API.LOGIN), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await parseResponse(response);

    const token = extractToken(data);

    if (!token) {
      throw new Error("No authentication token returned by the server");
    }

    const refreshToken = extractRefreshToken(data) ?? (await getRefreshToken());

    await persistTokens(token, refreshToken ?? undefined);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUserFromApi(userPayload);
    } else {
      user = await this.fetchCurrentUserWithToken(token);
    }

    await persistUser(user);

    return user;
  }

  static async register(credentials: RegisterCredentials): Promise<User> {
    const registerPayload: Record<string, unknown> = {
      email: credentials.email,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      birthDate: credentials.birthDate,
      gender: credentials.gender,
      departmentId: credentials.departmentId,
      neighborhoodId: credentials.neighborhoodId,
    };

    if (credentials.role) {
      registerPayload.role = credentials.role;
    }

    const response = await fetchWithTimeout(buildUrl("/users/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerPayload),
    });

    const data = await parseResponse(response);

    const token = extractToken(data);
    const refreshToken = extractRefreshToken(data) ?? (await getRefreshToken());

    if (!token) {
      // If the register endpoint doesn't return a token, attempt to log in with the same credentials
      const user = await this.login({
        email: credentials.email,
        password: credentials.password,
      });

      return user;
    }

    await persistTokens(token, refreshToken ?? undefined);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUserFromApi(userPayload);
    } else {
      user = await this.fetchCurrentUserWithToken(token);
    }

    await persistUser(user);

    return user;
  }

  static async saveUser(user: User | null): Promise<void> {
    if (!user) {
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return;
    }

    await persistUser(user);
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      return this.tryRefreshSession();
    }

    try {
      const user = await this.fetchCurrentUserWithToken(token);
      await persistUser(user);
      return user;
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        const refreshedUser = await this.tryRefreshSession();
        if (refreshedUser) {
          return refreshedUser;
        }
      }

      console.error("Get current user error:", error);
      const cachedUser = await AsyncStorage.getItem(USER_DATA_KEY);
      return cachedUser ? (JSON.parse(cachedUser) as User) : null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = await getRefreshToken();
    return !!token || !!refreshToken;
  }

  static async getAccessToken(): Promise<string | null> {
    const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (storedToken) {
      return storedToken;
    }

    try {
      const refreshed = await refreshTokens();
      return refreshed?.accessToken ?? null;
    } catch (error) {
      console.error("Get access token error:", error);
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      return null;
    }
  }

  private static async fetchCurrentUserWithToken(token: string): Promise<User> {
    const response = await fetchWithTimeout(buildUrl("/users/me"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(response);

    const userPayload = data.user || data.data || data;
    const user = mapUserFromApi(userPayload);
    return user;
  }

  private static async tryRefreshSession(): Promise<User | null> {
    try {
      const refreshed = await refreshTokens();

      if (!refreshed) {
        return null;
      }

      const user = await this.fetchCurrentUserWithToken(refreshed.accessToken);
      await persistUser(user);

      return user;
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      return null;
    }
  }
}
