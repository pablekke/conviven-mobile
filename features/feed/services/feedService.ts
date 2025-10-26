import { apiGet, apiPost } from "../../../services/apiHelper";
import { FEED_CONSTANTS } from "../constants";
import type { Roomie } from "../types";
import { FeedAdapter } from "../adapters";
import type { BackendFeedResponse } from "../adapters";

type MinimalFeedResponse = {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
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

function isMinimalFeedResponse(x: any): x is MinimalFeedResponse {
  return (
    x &&
    typeof x === "object" &&
    Array.isArray(x.items) &&
    typeof x.total === "number" &&
    typeof x.page === "number" &&
    typeof x.limit === "number" &&
    typeof x.totalPages === "number" &&
    typeof x.hasNext === "boolean" &&
    typeof x.hasPrev === "boolean"
  );
}

function isBackendFeedResponse(x: any): x is BackendFeedResponse {
  return (
    isMinimalFeedResponse(x) &&
    (x.items.length === 0 ||
      x.items.every((it: any) => it && typeof it === "object" && "userId" in it))
  );
}

class FeedService {
  async getMatchingFeed(
    page = 1,
    limit = FEED_CONSTANTS.ROOMIES_PER_PAGE,
  ): Promise<{
    items: Roomie[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const raw = await apiGet(`/matching?${params}`, { timeout: 30_000 });
      const data = normalizeApiResponse<unknown>(raw);
      if (!isMinimalFeedResponse(data)) {
        console.error("❌ /matching respondió con shape inesperado:", data);
        throw new Error("Respuesta inválida del servidor en /matching");
      }
      // Casteo seguro si cumple con el shape de backend
      const backendData: BackendFeedResponse = isBackendFeedResponse(data)
        ? (data as BackendFeedResponse)
        : ({ ...data, items: data.items as unknown[] as any[] } as unknown as BackendFeedResponse);
      return FeedAdapter.mapBackendResponseToFeedResponse(backendData);
    } catch (error) {
      console.error("Error fetching matching feed:", error);
      throw error;
    }
  }

  async sendMatchAction(action: {
    type: "like" | "pass" | "superlike";
    roomieId: string;
    timestamp: Date;
  }): Promise<{ success: boolean; isMatch?: boolean }> {
    try {
      const raw = await apiPost(`/matching/${action.roomieId}/${action.type}`, {
        timestamp: action.timestamp.toISOString(),
      });
      const data = normalizeApiResponse<any>(raw);
      const isMatch =
        (data?.data?.isMatch as boolean | undefined) ??
        (data?.isMatch as boolean | undefined) ??
        false;
      return { success: true, isMatch };
    } catch (error) {
      console.error("❌ Error sending match action:", {
        action,
        message: (error as any)?.message,
        status: (error as any)?.status,
        response: (error as any)?.response,
      });
      return { success: false };
    }
  }
}

export default new FeedService();
