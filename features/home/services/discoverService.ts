import { apiGet, apiPost } from "../../../services/apiHelper";
import { DISCOVER_CONSTANTS } from "../constants";
import { DiscoverCandidate, DiscoverFeed, MatchingItem } from "../types";

interface UserDetailsResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  neighborhoodId?: string;
  photoUrl?: string;
  secondaryPhotoUrls?: string[];
  profile?: {
    bio?: string;
    interests?: string[];
    hasPhoto?: boolean;
  };
}

interface MatchingResponse {
  items: MatchingItem[];
  nextPage?: number | null;
}

function calculateAge(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function mapMatchingItemToCandidate(m: MatchingItem): DiscoverCandidate {
  const fullName = ""; // Se completará al enriquecer con GET /users/:id
  const hasPhoto = m.user?.profile?.hasPhoto === true;
  const photosCount = m.user?.photosCount ?? 0;
  const nameFallback = fullName || "Usuario";
  return {
    id: m.userId,
    name: nameFallback,
    age: calculateAge(m.user?.birthDate),
    bio: m.user?.profile?.bio,
    interests: m.user?.profile?.interests,
    matchScore: Math.round(m.score),
    photoUrl:
      hasPhoto || photosCount > 0
        ? undefined
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFallback)}\u0026background=2563EB\u0026color=fff`,
    lastActiveDays: m.user?.lastActiveDays,
    profileCompletionPercent: Math.round((m.user?.profileCompletionRate ?? 0) * 100),
    photosCount,
  };
}

class DiscoverService {
  async getMatching(
    page: number = 1,
    limit: number = DISCOVER_CONSTANTS.PAGE_SIZE,
  ): Promise<DiscoverFeed> {
    try {
      const data = await apiGet<MatchingResponse | MatchingItem[]>(
        `/matching?page=${page}&limit=${limit}`,
      );

      const items: MatchingItem[] = Array.isArray(data) ? data : (data.items ?? []);
      const candidates = items.map(mapMatchingItemToCandidate);
      const nextPage = Array.isArray(data) ? null : (data.nextPage ?? null);
      return { candidates, nextPage };
    } catch (error) {
      const message = (error as any)?.message ?? String(error);
      if (typeof message === "string" && message.toLowerCase().includes("profile not found")) {
        return { candidates: [], nextPage: null };
      }
      console.warn("No se pudieron cargar /matching:", error);
      return { candidates: [], nextPage: null };
    }
  }

  async getUserDetails(userId: string): Promise<UserDetailsResponse> {
    return apiGet<UserDetailsResponse>(`/users/${userId}`);
  }

  async swipe(toUserId: string, action: "like" | "pass"): Promise<{ id?: string }> {
    return apiPost<{ id?: string }>(`/swipes`, { toUserId, action });
  }
}

export default new DiscoverService();
