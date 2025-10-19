import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, LoginCredentials, RegisterCredentials } from "@/types/user";
import { mapUserFromApi } from "./mappers/userMapper";
import { resilientRequest } from "./apiClient";
import { API } from "@/constants";
import { authSession } from "./auth/sessionManager";
import { extractAccessToken, extractRefreshToken } from "./auth/tokenUtils";

const USER_DATA_KEY = "user_data";

async function persistUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export default class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    const data = await resilientRequest<any>({
      endpoint: API.LOGIN,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: credentials,
      allowQueue: false,
    });

    const accessToken = extractAccessToken(data);

    if (!accessToken) {
      throw new Error("No authentication token returned by the server");
    }

    const refreshToken = extractRefreshToken(data) ?? (await authSession.getRefreshToken());

    await authSession.setTokens(accessToken, refreshToken ?? null);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUserFromApi(userPayload);
    } else {
      user = await this.fetchCurrentUser();
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

    const data = await resilientRequest<any>({
      endpoint: "/users/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: registerPayload,
      allowQueue: false,
    });

    const accessToken = extractAccessToken(data);
    const refreshToken = extractRefreshToken(data) ?? (await authSession.getRefreshToken());

    if (!accessToken) {
      // If the register endpoint doesn't return a token, attempt to log in with the same credentials
      const user = await this.login({
        email: credentials.email,
        password: credentials.password,
      });

      return user;
    }

    await authSession.setTokens(accessToken, refreshToken ?? null);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUserFromApi(userPayload);
    } else {
      user = await this.fetchCurrentUser();
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
    const refreshToken = await authSession.getRefreshToken();

    try {
      if (refreshToken) {
        await resilientRequest({
          endpoint: API.LOGOUT,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: { refreshToken },
          allowQueue: false,
        });
      }
    } catch (error) {
      console.warn("Logout request failed", error);
    } finally {
      await authSession.clearTokens();
      await AsyncStorage.removeItem(USER_DATA_KEY);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.fetchCurrentUser();
      await persistUser(user);
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      const cachedUser = await AsyncStorage.getItem(USER_DATA_KEY);
      return cachedUser ? (JSON.parse(cachedUser) as User) : null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    return authSession.hasSession();
  }

  static async getAccessToken(): Promise<string | null> {
    const storedToken = await authSession.getAccessToken();

    if (storedToken) {
      return storedToken;
    }

    try {
      const refreshed = await authSession.refreshAccessToken();
      return refreshed ?? null;
    } catch (error) {
      console.error("Get access token error:", error);
      await authSession.clearTokens();
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return null;
    }
  }

  private static async fetchCurrentUser(): Promise<User> {
    const data = await resilientRequest<any>({
      endpoint: "/users/me",
      method: "GET",
      useCache: false,
    });

    const userPayload = data.user || data.data || data;
    const user = mapUserFromApi(userPayload);
    return user;
  }
}
