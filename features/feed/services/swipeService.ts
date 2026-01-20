import { apiGet } from "../../../services/apiHelper";
import { resilientRequest } from "../../../services/apiClient";
import { HttpMethod } from "../../../core/enums/http.enums";

type SwipeAction = "like" | "pass";

export type Swipe = {
  id: string;
  fromUserId: string;
  toUserId: string;
  action: SwipeAction;
  match?: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeApiResponse<T = unknown>(response: unknown): T {
  if (response && typeof response === "object" && "data" in (response as any)) {
    return (response as any).data as T;
  }
  if (typeof response === "string") {
    try {
      return JSON.parse(response) as T;
    } catch {}
  }
  return response as T;
}

export interface SwipeResponse {
  swipe: Swipe;
  isMatch: boolean;
}

class SwipeService {
  /**
   * POST /api/swipes
   * Body: { toUserId, action: "like" | "pass" }
   */
  async createSwipe(input: { toUserId: string; action: SwipeAction }): Promise<SwipeResponse> {
    try {
      const raw = await resilientRequest<any>({
        endpoint: "/swipes",
        method: HttpMethod.POST,
        body: {
          toUserId: input.toUserId,
          action: input.action,
        },
        timeout: 30000,
        allowQueue: true,
      });
      return normalizeApiResponse<SwipeResponse>(raw);
    } catch (error) {
      console.error("❌ [SwipeService] Error sending action:", {
        toUserId: input.toUserId,
        action: input.action,
        message: (error as any)?.message,
        status: (error as any)?.status,
      });
      throw error;
    }
  }

  /**
   * GET /api/swipes
   */
  async listMySwipes(): Promise<Swipe[]> {
    const raw = await apiGet("/swipes", { timeout: 30_000 });
    return normalizeApiResponse<Swipe[]>(raw);
  }
}

export default new SwipeService();
