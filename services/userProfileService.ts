import AuthService from "./authService";
import { UserProfile, UserSearchPreferences } from "../types/user";
import { resilientRequest } from "./apiClient";

class UserProfileService {
  private async getAuthHeaders() {
    const token = await AuthService.getAccessToken();

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const method = (options.method ?? "GET") as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    let body: any = options.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (error) {
        body = options.body;
      }
    }

    return resilientRequest<T>({
      endpoint,
      method,
      headers: {
        ...authHeaders,
        ...(options.headers as Record<string, string> | undefined),
      },
      body,
      allowQueue: method !== "GET",
      useCache: method === "GET",
    });
  }

  /**
   * Obtener el perfil completo del usuario (con profile y searchPreferences)
   */
  async getFullUserProfile(): Promise<{
    profile?: UserProfile;
    searchPreferences?: UserSearchPreferences;
  }> {
    try {
      const data = await this.makeRequest<any>("/users/me");
      const userData = data.user || data.data || data;

      return {
        profile: userData.profile,
        searchPreferences: userData.searchPreferences,
      };
    } catch (error) {
      console.error("Error getting full user profile:", error);
      throw error;
    }
  }
}

export default new UserProfileService();
