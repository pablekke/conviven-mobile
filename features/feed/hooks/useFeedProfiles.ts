import { incomingProfilesMock, type MockedBackendUser } from "../mocks/incomingProfile";
import { mapBackendItemToMockedUser } from "../adapters/backendToMockedUser";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useFeedPrefetchHydrator } from "./useFeedPrefetchHydrator";
import { prefetchRoomiesImages } from "../utils/prefetchImages";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";
import { FEED_USE_MOCK } from "@/config/env";
import { feedService } from "../services";

export interface UseFeedProfilesReturn {
  profiles: MockedBackendUser[];
  isLoading: boolean;
  noMoreProfiles: boolean;
  refresh: () => Promise<void>;
}

export function useFeedProfiles(): UseFeedProfilesReturn {
  const [profiles, setProfiles] = useState<MockedBackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const { hydratePrefetchedFeed } = useFeedPrefetchHydrator();
  const { isPreloading, preloadCompleted } = useDataPreload();
  const { isAuthenticated } = useAuth();

  const loadProfiles = useCallback(async (isMounted: boolean = true) => {
    setIsLoading(true);

    if (FEED_USE_MOCK) {
      if (isMounted) {
        setProfiles(incomingProfilesMock);
        setNoMoreProfiles(incomingProfilesMock.length === 0);
        setIsLoading(false);

        prefetchRoomiesImages(incomingProfilesMock).catch(error => {
          console.debug("[useFeedProfiles] Error precargando imágenes (mock):", error);
        });
      }
      return incomingProfilesMock;
    }

    try {
      const response = await feedService.getMatchingFeed(1, FEED_CONSTANTS.ROOMIES_PER_PAGE);
      const backendProfiles = response.raw.items
        .map(mapBackendItemToMockedUser)
        .filter(Boolean) as MockedBackendUser[];

      if (!isMounted) return [];

      if (backendProfiles.length > 0) {
        setProfiles(backendProfiles);
        setNoMoreProfiles(false);

        prefetchRoomiesImages(backendProfiles).catch(error => {
          console.debug("[useFeedProfiles] Error precargando imágenes:", error);
        });
      } else {
        setProfiles([]);
        setNoMoreProfiles(true);
      }
      return backendProfiles;
    } catch (error) {
      console.warn("[useFeedProfiles] Backend feed unavailable:", error);
      if (isMounted) {
        setProfiles([]);
        setNoMoreProfiles(true);
      }
      return [];
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (isPreloading || !preloadCompleted) {
      return;
    }

    let isMounted = true;

    const prefetched = hydratePrefetchedFeed({ invalidate: false });
    if (prefetched) {
      if (isMounted) {
        setProfiles(prefetched.profiles);
        setNoMoreProfiles(prefetched.profiles.length === 0);
        setIsLoading(false);

        prefetchRoomiesImages(prefetched.profiles).catch(error => {
          console.debug("[useFeedProfiles] Error precargando imágenes:", error);
        });
      }

      return () => {
        isMounted = false;
      };
    }

    loadProfiles(isMounted);

    return () => {
      isMounted = false;
    };
  }, [hydratePrefetchedFeed, isPreloading, preloadCompleted, isAuthenticated, loadProfiles]);

  const refresh = async () => {
    hydratePrefetchedFeed({ invalidate: true });
    const newProfiles = await loadProfiles(true);

    if (newProfiles.length === 0) {
      Toast.show({
        type: "info",
        text1: "Sin novedades",
        text2: "No encontramos nuevos perfiles por ahora. \n¡Probá más tarde!",
      });
    }
  };

  return {
    profiles,
    isLoading,
    noMoreProfiles,
    refresh,
  };
}
