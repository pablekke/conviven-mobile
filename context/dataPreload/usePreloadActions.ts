import { loadSearchFiltersAction } from "./actions/filterActions";
import { loadProfileAction } from "./actions/profileActions";
import { loadChatsAction } from "./actions/chatActions";
import { createTimeoutPromise } from "./utils";
import { DataPreloadState } from "./types";
import { useCallback } from "react";

export const usePreloadActions = (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
  user: any,
  isAuthenticated: boolean,
  authLoading: boolean,
) => {
  const loadChats = useCallback(
    async (forceRefresh = false) => {
      if (!user || !isAuthenticated) return;
      await loadChatsAction(setState, forceRefresh);
    },
    [user, isAuthenticated, setState],
  );

  const loadProfile = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    await loadProfileAction(setState);
  }, [user, isAuthenticated, setState]);

  const loadSearchFilters = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    await loadSearchFiltersAction(setState);
  }, [user, isAuthenticated, setState]);

  const preloadAllData = useCallback(async () => {
    if (!user || !isAuthenticated || authLoading) {
      return;
    }

    setState(prev => ({
      ...prev,
      isPreloading: true,
      preloadError: null,
      preloadCompleted: false,
    }));

    try {
      const timeoutPromise = createTimeoutPromise("Preload timeout", 10000);

      await Promise.race([
        Promise.allSettled([loadChats(), loadProfile(), loadSearchFilters()]),
        timeoutPromise,
      ]);

      setState(prev => ({
        ...prev,
        isPreloading: false,
        preloadCompleted: true,
        preloadError: null,
      }));
    } catch (error) {
      console.error("[DataPreload] Error en precarga general:", error);
      setState(prev => ({
        ...prev,
        isPreloading: false,
        preloadCompleted: true,
        preloadError: error instanceof Error ? error : new Error("Error en precarga"),
      }));
    }
  }, [user, isAuthenticated, authLoading, loadChats, loadProfile, loadSearchFilters, setState]);

  return {
    loadChats,
    loadProfile,
    loadSearchFilters,
    preloadAllData,
  };
};
