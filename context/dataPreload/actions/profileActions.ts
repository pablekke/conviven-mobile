import UserProfileService from "../../../services/userProfileService";
import { createTimeoutPromise } from "../utils";
import { DataPreloadState } from "../types";
import React from "react";

let lastProfileCallTime = 0;
const PROFILE_CALL_COOLDOWN = 3000;

export const loadProfileAction = async (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
  skipIfRecent?: boolean,
) => {
  const now = Date.now();

  if (skipIfRecent && lastProfileCallTime && now - lastProfileCallTime < PROFILE_CALL_COOLDOWN) {
    return;
  }

  lastProfileCallTime = now;
  setState(prev => ({ ...prev, profileLoading: true, profileError: null }));

  try {
    const timeoutPromise = createTimeoutPromise("Profile timeout", 5000);

    const fullProfile = (await Promise.race([
      UserProfileService.getFullUserProfile(),
      timeoutPromise,
    ])) as { filters?: any };

    setState(prev => ({
      ...prev,
      fullProfile,
      profileLoading: false,
      profileError: null,
      profileLastUpdated: Date.now(),
      searchFilters: fullProfile.filters || prev.searchFilters,
      searchFiltersLastUpdated: fullProfile.filters ? Date.now() : prev.searchFiltersLastUpdated,
    }));
  } catch (error) {
    console.error("Error precargando perfil:", error);
    setState(prev => ({
      ...prev,
      fullProfile: null,
      profileLoading: false,
      profileError: error instanceof Error ? error : new Error("Error desconocido"),
      profileLastUpdated: null,
    }));
  }
};
