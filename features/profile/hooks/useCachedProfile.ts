import { useCallback, useMemo } from "react";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useAuth } from "../../../context/AuthContext";
import { UserProfileData } from "../interfaces";
import { profileMappingService } from "../services";

export interface UseCachedProfileReturn {
  fullProfile: any | null;
  profileData: UserProfileData;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  isDataFresh: boolean;
}

const DEFAULT_PROFILE_DATA: UserProfileData = {
  bio: "",
  smokingStatus: "",
  marijuanaStatus: "",
  alcoholStatus: "",
  hasPets: "",
  petsOwned: [],
  acceptsPets: "",
  tidinessLevel: "",
  socialLife: "",
  sleepTime: "",
  cooking: "",
  diet: "",
  sharePolicy: "",
  interests: [],
  zodiacSign: "",
};

/**
 * Hook optimizado que usa el cache del DataPreloadContext
 * El perfil se precarga al iniciar la app, por lo que este hook
 * devuelve inmediatamente los datos cached sin loading extra
 */
export const useCachedProfile = (): UseCachedProfileReturn => {
  const { user } = useAuth();
  const {
    fullProfile,
    profileLoading: loading,
    profileError: error,
    refreshProfile,
    isDataFresh,
  } = useDataPreload();

  const handleRefresh = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  // Map full profile to form data
  const profileData = useMemo((): UserProfileData => {
    if (!fullProfile || !user) {
      return DEFAULT_PROFILE_DATA;
    }

    try {
      const userWithProfile = {
        ...user,
        profile: fullProfile.profile,
      };

      return profileMappingService.mapUserProfileToFormData(userWithProfile);
    } catch (error) {
      return DEFAULT_PROFILE_DATA;
    }
  }, [fullProfile, user]);

  // Check if data is fresh (within 5 minutes)
  const dataIsFresh = isDataFresh("profile");

  return {
    fullProfile,
    profileData,
    loading,
    error,
    refreshProfile: handleRefresh,
    isDataFresh: dataIsFresh,
  };
};
