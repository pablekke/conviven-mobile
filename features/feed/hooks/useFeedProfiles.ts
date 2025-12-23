import { incomingProfilesMock, type MockedBackendUser } from "../mocks/incomingProfile";
import { mapBackendItemToMockedUser } from "../adapters/backendToMockedUser";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useFeedPrefetchHydrator } from "./useFeedPrefetchHydrator";
import { prefetchRoomiesImages } from "../utils/prefetchImages";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useAuth } from "../../../context/AuthContext";
import { FEED_USE_MOCK } from "@/config/env";
import { useState, useEffect } from "react";
import { feedService } from "../services";

export interface UseFeedProfilesReturn {
  profiles: MockedBackendUser[];
  isLoading: boolean;
  noMoreProfiles: boolean;
}

export function useFeedProfiles(): UseFeedProfilesReturn {
  const [profiles, setProfiles] = useState<MockedBackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const { hydratePrefetchedFeed } = useFeedPrefetchHydrator();
  const { isPreloading, preloadCompleted } = useDataPreload();
  const { isAuthenticated } = useAuth();

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

    const loadProfiles = async () => {
      if (FEED_USE_MOCK) {
        if (isMounted) {
          setProfiles(incomingProfilesMock);
          setNoMoreProfiles(incomingProfilesMock.length === 0);
          setIsLoading(false);

          prefetchRoomiesImages(incomingProfilesMock).catch(error => {
            console.debug("[useFeedProfiles] Error precargando imágenes (mock):", error);
          });
        }
        return;
      }

      try {
        const response = await feedService.getMatchingFeed(1, FEED_CONSTANTS.ROOMIES_PER_PAGE);
        const backendProfiles = response.raw.items
          .map(mapBackendItemToMockedUser)
          .filter(Boolean) as MockedBackendUser[];

        if (!isMounted) return;

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
      } catch (error) {
        console.warn("[useFeedProfiles] Backend feed unavailable:", error);
        if (isMounted) {
          setProfiles([]);
          setNoMoreProfiles(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [hydratePrefetchedFeed, isPreloading, preloadCompleted, isAuthenticated]);

  return {
    profiles,
    isLoading,
    noMoreProfiles,
  };
}
