import { useState, useEffect, useCallback } from "react";
import UserService from "@/services/userService";
import { User } from "@/types/user";
import { useDataPreload } from "@/context/DataPreloadContext";
import { getCachedValue } from "@/services/resilience/cache";

export interface UserProfileDetail {
  user: User;
  ui: {
    profile: any;
    location: any;
    filters: any;
  };
}

// Internal mappers to avoid mock dependencies
const mapLocation = (loc: any) => ({
  neighborhood: { name: loc?.neighborhood?.name || "" },
  city: { name: loc?.city?.name || "" },
  department: { name: loc?.department?.name || "" },
});

const mapUserToUi = (userData: User | any) => {
  const profile = userData.profile;
  const filters = userData.filters;

  return {
    profile: {
      bio: profile?.bio ?? "",
      occupation: profile?.occupation ?? undefined,
      education: profile?.education ?? undefined,
      tidiness: profile?.tidiness ?? undefined,
      schedule: profile?.schedule ?? undefined,
      guestsFreq: profile?.guestsFreq ?? undefined,
      musicUsage: profile?.musicUsage ?? undefined,
      petsOwned: profile?.petsOwned ?? [],
      petsOk: profile?.petsOk ?? undefined,
      cooking: profile?.cooking ?? undefined,
      diet: profile?.diet ?? undefined,
      sharePolicy: profile?.sharePolicy ?? undefined,
      languages: profile?.languages ?? [],
      interests: profile?.interests ?? [],
      smokesCigarettes: profile?.smokesCigarettes ?? undefined,
      smokesWeed: profile?.smokesWeed ?? undefined,
      alcohol: profile?.alcohol ?? undefined,
    },
    location: mapLocation(userData.location),
    filters: {
      budgetMin: filters?.budgetMin,
      budgetMax: filters?.budgetMax,
      mainPreferredLocation: mapLocation(filters?.mainPreferredLocation),
      preferredLocations: (filters?.preferredLocations || []).map(mapLocation),
    },
  };
};

export function useUserProfileDetail(userId: string) {
  const { chats } = useDataPreload();
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Intentar buscar en el caché de conversaciones (chats)
      const chatPartner = chats.find(c => c.id === userId || c.userFullInfo?.id === userId);
      if (chatPartner?.userFullInfo) {
        setProfile({
          user: chatPartner.userFullInfo as any,
          ui: mapUserToUi(chatPartner.userFullInfo),
        });
        setLoading(false);
        return;
      }

      // 2. Intentar buscar en el caché de matches
      const cachedMatches = await getCachedValue<any>("/matches");
      if (cachedMatches?.items) {
        const matchedItem = cachedMatches.items.find((item: any) => item.user?.id === userId);
        if (matchedItem?.user) {
          setProfile({
            user: matchedItem.user,
            ui: mapUserToUi(matchedItem.user),
          });
          setLoading(false);
          return;
        }
      }

      // 3. Si no está en caché, traer de la API
      const userData = await UserService.getById(userId);

      if (userData) {
        setProfile({
          user: userData,
          ui: mapUserToUi(userData),
        });
      } else {
        throw new Error("No se pudo obtener el perfil del usuario");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
    } finally {
      setLoading(false);
    }
  }, [userId, chats]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, error, refresh: loadProfile };
}
