import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, LoginCredentials, RegisterCredentials } from "../types/user";

const API_BASE_URL = "https://conviven-backend.onrender.com/api";
const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function parseResponse(response: Response): Promise<any> {
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

    throw new Error(message);
  }

  return payload;
}

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
    data.tokens ||
    data.tokenData ||
    data.credentials ||
    data.session ||
    data.data?.tokens;

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

function mapUser(data: any): User {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid user payload received from server");
  }

  const firstName = data.firstName || data.firstname || data.name?.split(" ")?.[0] || undefined;
  const lastName = data.lastName || data.lastname || undefined;
  const department = data.department || {};
  const neighborhood = data.neighborhood || {};

  const composedName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const name =
    (typeof data.name === "string" && data.name.trim()) ||
    (composedName.length > 0 ? composedName : undefined) ||
    data.email ||
    undefined;

  return {
    id: data.id || data._id || "",
    email: data.email || "",
    name: name || "Usuario",
    firstName,
    lastName,
    avatar: data.avatar || data.avatarUrl || undefined,
    bio: data.bio || undefined,
    location: data.location || data.address?.name || undefined,
    phone: data.phone || undefined,
    birthDate: data.birthDate || data.birthdate || undefined,
    gender: data.gender || undefined,
    departmentId: department.id || data.departmentId || undefined,
    departmentName: department.name || undefined,
    neighborhoodId: neighborhood.id || data.neighborhoodId || undefined,
    neighborhoodName: neighborhood.name || undefined,
  };
}

async function persistUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export default class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(buildUrl("/auth/login"), {
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

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUser(userPayload);
    } else {
      user = await this.fetchCurrentUserWithToken(token);
    }

    await persistUser(user);

    return user;
  }

  static async register(credentials: RegisterCredentials): Promise<User> {
    const response = await fetch(buildUrl("/users/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        birthDate: credentials.birthDate,
        gender: credentials.gender,
        departmentId: credentials.departmentId,
        neighborhoodId: credentials.neighborhoodId,
      }),
    });

    const data = await parseResponse(response);

    let token = extractToken(data);

    if (!token) {
      // If the register endpoint doesn't return a token, attempt to log in with the same credentials
      const user = await this.login({
        email: credentials.email,
        password: credentials.password,
      });

      return user;
    }

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

    const userPayload = data.user || data.data?.user;
    let user: User;

    if (userPayload) {
      user = mapUser(userPayload);
    } else {
      user = await this.fetchCurrentUserWithToken(token);
    }

    await persistUser(user);

    return user;
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const user = await this.fetchCurrentUserWithToken(token);
      await persistUser(user);
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      const cachedUser = await AsyncStorage.getItem(USER_DATA_KEY);
      return cachedUser ? (JSON.parse(cachedUser) as User) : null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }

  private static async fetchCurrentUserWithToken(token: string): Promise<User> {
    const response = await fetch(buildUrl("/users/me"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(response);

    const userPayload = data.user || data.data || data;
    const user = mapUser(userPayload);
    return user;
  }
}
