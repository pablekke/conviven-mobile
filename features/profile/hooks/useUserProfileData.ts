import { UserProfileData, UseUserProfileDataReturn } from "../interfaces";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { setCachedValue } from "../../../services/resilience/cache";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { userProfileUpdateService } from "../services";
import { useCachedProfile } from "./useCachedProfile";

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

export const useUserProfileData = (): UseUserProfileDataReturn => {
  const { user, updateUser } = useAuth() as any;
  const { profileData: cachedProfileData, loading: cacheLoading } = useCachedProfile();
  const { refreshProfile: refreshDataPreloadProfile } = useDataPreload();
  const [profileData, setProfileData] = useState<UserProfileData>(
    cachedProfileData || DEFAULT_PROFILE_DATA,
  );
  const [originalData, setOriginalData] = useState<UserProfileData>(
    cachedProfileData || DEFAULT_PROFILE_DATA,
  );

  const [loading, setLoading] = useState(cacheLoading);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!cacheLoading && cachedProfileData) {
      setProfileData(cachedProfileData);
      setOriginalData(cachedProfileData);
      setHasChanges(false);
      setLoading(false);
    } else if (!cacheLoading && !cachedProfileData) {
      setProfileData(DEFAULT_PROFILE_DATA);
      setOriginalData(DEFAULT_PROFILE_DATA);
      setHasChanges(false);
      setLoading(false);
    } else {
      setLoading(cacheLoading);
    }
  }, [cachedProfileData, cacheLoading]);

  const updateProfileData = useCallback(
    (field: keyof UserProfileData, value: string | string[]) => {
      setProfileData(prev => {
        const newData = { ...prev, [field]: value };
        const changed = JSON.stringify(newData) !== JSON.stringify(originalData);
        setHasChanges(changed);

        if (changed) {
          setCachedValue("@profile/draft", newData).catch(() => {});
        }

        return newData;
      });
    },
    [originalData],
  );

  const getChanges = useCallback((): Partial<UserProfileData> => {
    const changes: Partial<UserProfileData> = {};
    let hasDiff = false;

    (Object.keys(profileData) as typeof profileData).forEach(key => {
      if (JSON.stringify(profileData[key]) !== JSON.stringify(originalData[key])) {
        changes[key] = profileData[key] as any;
        hasDiff = true;
      }
    });

    return hasDiff ? changes : {};
  }, [profileData, originalData]);

  const saveProfileData = useCallback(async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const changes = getChanges();
    if (Object.keys(changes).length === 0) {
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await userProfileUpdateService.updateUserProfile(changes);

      updateUser(updatedUser);
      setOriginalData(prev => ({ ...prev, ...changes }));
      setHasChanges(false);
      await refreshDataPreloadProfile();
    } catch (error) {
      console.error("❌ Error al guardar perfil:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, getChanges, updateUser, refreshDataPreloadProfile]);

  const resetToUserData = useCallback(() => {
    setProfileData(originalData);
    setHasChanges(false);
  }, [originalData]);

  return {
    profileData,
    loading,
    saving,
    hasChanges,
    updateProfileData,
    saveProfileData,
    resetToUserData,
    getChanges,
  };
};
