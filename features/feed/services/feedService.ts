import { apiGet, apiPost } from "../../../services/apiHelper";
import { FEED_CONSTANTS } from "../constants";
import type { MatchingFeedResponse } from "../types";
import { FeedAdapter } from "../adapters";

class FeedService {
  /**
   * Obtiene la lista de roomies del matching feed
   */
  async getMatchingFeed(
    page = 1,
    limit = FEED_CONSTANTS.ROOMIES_PER_PAGE,
  ): Promise<MatchingFeedResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      console.log("🚀 Making request to /matching endpoint...");
      console.log("📊 Params:", { page, limit });

      const response = await apiGet(`/matching?${params}`, {
        timeout: 30000, // 30 segundos de timeout
      });

      console.log("📡 Raw response from /matching:", response);
      console.log("📡 Response type:", typeof response);
      console.log("📡 Response keys:", response ? Object.keys(response) : "null/undefined");

      if (response && typeof response === "object") {
        console.log("📡 Response.items:", (response as any).items);
        console.log("📡 Response.total:", (response as any).total);
        console.log("📡 Response.page:", (response as any).page);
      }

      // Usar el adaptador para convertir la respuesta del backend
      return FeedAdapter.mapBackendResponseToFeedResponse(response as any);
    } catch (error) {
      console.error("Error fetching matching feed:", error);
      throw error; // Re-lanzar el error para que se maneje en el hook
    }
  }

  /**
   * Envía una acción de match (like, pass, superlike)
   */
  async sendMatchAction(action: {
    type: "like" | "pass" | "superlike";
    roomieId: string;
    timestamp: Date;
  }): Promise<{ success: boolean; isMatch?: boolean }> {
    try {
      console.log("🎯 Sending match action:", action);
      console.log("🎯 Endpoint:", `/matching/${action.roomieId}/${action.type}`);

      const response = await apiPost(`/matching/${action.roomieId}/${action.type}`, {
        timestamp: action.timestamp.toISOString(),
      });

      console.log("🎯 Match action response:", response);
      console.log("🎯 Response type:", typeof response);

      if (response && typeof response === "object") {
        console.log("🎯 Response.data:", (response as any).data);
        console.log("🎯 Response.status:", (response as any).status);
      }

      return {
        success: true,
        isMatch: (response as any)?.isMatch || false,
      };
    } catch (error) {
      console.error("❌ Error sending match action:", error);
      console.error("❌ Error details:", {
        message: (error as any)?.message,
        status: (error as any)?.status,
        response: (error as any)?.response,
      });
      return { success: false };
    }
  }
}

export default new FeedService();
