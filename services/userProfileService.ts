import { HttpMethod } from "@/core/enums/http.enums";
import { resilientRequest } from "./apiClient";
import { User } from "../types/user";

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

  async getFullUserProfile(): Promise<User> {
    try {
      const data = await this.makeRequest<any>("/users/me");
      const userData = (data.user || data.data || data) as User;
      return userData;
    } catch (error) {
      console.error("Error getting full user profile:", error);
      throw error;
    }
  }
}

export default new UserProfileService();
