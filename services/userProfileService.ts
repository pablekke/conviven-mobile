import { UserProfile, UserSearchPreferences } from "../types/user";
import { resilientRequest } from "./apiClient";
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

class UserProfileService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = resolveMethod(options.method);
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
      headers: options.headers as Record<string, string> | undefined,
      body,
      allowQueue: method !== HttpMethod.GET,
      useCache: method === HttpMethod.GET,
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
