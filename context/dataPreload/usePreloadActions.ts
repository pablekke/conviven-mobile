import { useFeedPrefetch } from "@/features/feed/hooks/useFeedPrefetch";
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
  const { prefetchFeed } = useFeedPrefetch();
  const loadChats = useCallback(
    async (forceRefresh = false) => {
      if (!user || !isAuthenticated) return;

      const hasFilters = user?.filters && Object.keys(user.filters).length > 0;
      if (!hasFilters) return;

      await loadChatsAction(setState, forceRefresh);
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

    const hasFilters = user?.filters && Object.keys(user.filters).length > 0;
    if (!hasFilters) return;

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

      const hasFilters = user?.filters && Object.keys(user.filters).length > 0;

      const preloadPromises: Promise<any>[] = [
        // Always try to load profile
        loadProfile(true),
      ];

      if (hasFilters) {
        preloadPromises.push(loadChats());
        preloadPromises.push(loadSearchFilters());
        preloadPromises.push(
          prefetchFeed().catch(error => {
            console.warn("[DataPreload] Error precargando feed:", error);
          }),
        );
      }

      await Promise.race([
        Promise.allSettled(preloadPromises).then(() => {
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
    loadProfile,
    loadSearchFilters,
    preloadAllData,
  };
};
