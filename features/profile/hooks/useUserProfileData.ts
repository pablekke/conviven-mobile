import { UserProfileData, UseUserProfileDataReturn } from "../interfaces";
import { setCachedValue } from "../../../services/resilience/cache";
import { useDataPreload } from "../../../context/DataPreloadContext";
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
  acceptsPets: "",
  tidinessLevel: "",
  socialLife: "",
  workSchedule: "",
  sleepTime: "",
};

export const useUserProfileData = (): UseUserProfileDataReturn => {
  const { user, updateUser } = useAuth() as any;
  const { profileData: cachedProfileData, fullProfile, loading: cacheLoading } = useCachedProfile();
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
    (field: keyof UserProfileData, value: string) => {
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

  const saveProfileData = useCallback(async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setSaving(true);
    try {
      const changedFields: Partial<UserProfileData> = {};

      Object.keys(profileData).forEach(key => {
        const field = key as keyof UserProfileData;
        if (profileData[field] !== originalData[field]) {
          changedFields[field] = profileData[field];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setSaving(false);
        return;
      }

      const completeProfileData = {
        ...changedFields,
        ...(fullProfile?.profile && {
          cooking: fullProfile.profile.cooking,
          diet: fullProfile.profile.diet,
          sharePolicy: fullProfile.profile.sharePolicy,
          interests: fullProfile.profile.interests,
          zodiacSign: fullProfile.profile.zodiacSign,
          musicUsage: fullProfile.profile.musicUsage,
          quietHoursStart: fullProfile.profile.quietHoursStart,
          quietHoursEnd: fullProfile.profile.quietHoursEnd,
        }),
      };

      const updatedUser = await userProfileUpdateService.updateUserProfile(completeProfileData);

      updateUser(updatedUser);
      setOriginalData(profileData);
      setHasChanges(false);
      await refreshDataPreloadProfile();
    } catch (error) {
      console.error("❌ Error al guardar perfil:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, profileData, originalData, fullProfile, updateUser, refreshDataPreloadProfile]);

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
  };
};
