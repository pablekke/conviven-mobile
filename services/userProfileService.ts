import { API_BASE_URL } from "../config/env";
import AuthService from "./authService";
import { UserProfile, UserSearchPreferences } from "../types/user";

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
    const url = `${API_BASE_URL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const response = await fetch(url, {
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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
