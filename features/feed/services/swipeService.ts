import { apiGet, apiPost } from "../../../services/apiHelper";

type SwipeAction = "like" | "pass";

export type Swipe = {
  id: string;
  fromUserId: string;
  toUserId: string;
  action: SwipeAction;
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

class SwipeService {
  /**
   * POST /api/swipes
   * Body: { toUserId, action: "like" | "pass" }
   */
  async createSwipe(input: { toUserId: string; action: SwipeAction }): Promise<Swipe> {
    const raw = await apiPost("/swipes", input);
    return normalizeApiResponse<Swipe>(raw);
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
