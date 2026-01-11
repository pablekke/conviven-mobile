import { useFeedPrefetch } from "@/features/feed/hooks/useFeedPrefetch";
import { loadSearchFiltersAction } from "./actions/filterActions";
import { loadProfileAction } from "./actions/profileActions";
import { loadMatchesAction } from "./actions/matchActions";
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
  const { prefetchFeed } = useFeedPrefetch();
  const loadChats = useCallback(
    async (forceRefresh = false, silent = false) => {
      if (!user || !isAuthenticated) return;
      await loadChatsAction(setState, forceRefresh, silent);
    },
    [user, isAuthenticated, setState],
  );

  const loadMatches = useCallback(
    async (forceRefresh = false, silent = false) => {
      if (!user || !isAuthenticated) return;
      await loadMatchesAction(setState, forceRefresh, silent);
    },
    [user, isAuthenticated, setState],
  );

  const loadProfile = useCallback(
    async (skipIfRecent = false) => {
      if (!user || !isAuthenticated) return;
      await loadProfileAction(setState, skipIfRecent);
    },
    [user, isAuthenticated, setState],
  );

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
      const timeoutPromise = createTimeoutPromise("Preload timeout", 20000);

      await Promise.race([
        Promise.allSettled([
          loadChats(),
          loadMatches(),
          loadProfile(true),
          loadSearchFilters(),
          prefetchFeed().catch(error => {
            console.warn("[DataPreload] Error precargando feed:", error);
          }),
        ]).then(() => {
          return new Promise(resolve => setTimeout(resolve, 100));
        }),
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
  }, [
    user,
    isAuthenticated,
    authLoading,
    loadChats,
    loadProfile,
    loadSearchFilters,
    prefetchFeed,
    setState,
  ]);

  return {
    loadChats,
    loadMatches,
    loadProfile,
    loadSearchFilters,
    preloadAllData,
  };
};
