import { incomingProfilesMock, MockedBackendUser } from "../mocks/incomingProfile";
import { mapBackendItemToMockedUser } from "../adapters/backendToMockedUser";
import { prefetchRoomiesImages } from "../utils/prefetchImages";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { FEED_USE_MOCK } from "@/config/env";
import { feedService } from "../services";
import { useCallback } from "react";

export type PrefetchedFeedPayload = {
  profiles: MockedBackendUser[];
  hasMore: boolean;
  timestamp: number;
};

let feedPrefetchCache: PrefetchedFeedPayload | null = null;
let feedPrefetchPromise: Promise<PrefetchedFeedPayload> | null = null;

export function useFeedPrefetch() {
  const prefetchFeed = useCallback(async (): Promise<PrefetchedFeedPayload> => {
    if (feedPrefetchCache) {
      return feedPrefetchCache;
    }

    if (FEED_USE_MOCK) {
      feedPrefetchCache = {
        profiles: incomingProfilesMock,
        hasMore: incomingProfilesMock.length > 0,
        timestamp: Date.now(),
      };

      await prefetchRoomiesImages(incomingProfilesMock).catch(error => {
        console.debug("[useFeedPrefetch] Error precargando imágenes (mock):", error);
      });

      return feedPrefetchCache;
    }

    if (!feedPrefetchPromise) {
      feedPrefetchPromise = (async () => {
        const response = await feedService.getMatchingFeed(1, FEED_CONSTANTS.ROOMIES_PER_PAGE);

        const profiles = response.raw.items
          .map(mapBackendItemToMockedUser)
          .filter(Boolean) as MockedBackendUser[];

        const payload: PrefetchedFeedPayload = {
          profiles,
          hasMore: response.hasNext,
          timestamp: Date.now(),
        };

        feedPrefetchCache = payload;

        await prefetchRoomiesImages(profiles).catch(error => {
          console.debug("[useFeedPrefetch] Error precargando imágenes:", error);
        });

        return payload;
      })().finally(() => {
        feedPrefetchPromise = null;
      });
    }

    return feedPrefetchPromise;
  }, []);

  const consumePrefetchedFeed = useCallback((options: { invalidate?: boolean } = {}) => {
    const data = feedPrefetchCache;
    if (options.invalidate) {
      feedPrefetchCache = null;
    }
    return data;
  }, []);

  const clearPrefetch = useCallback(() => {
    feedPrefetchCache = null;
    feedPrefetchPromise = null;
  }, []);

  return {
    prefetchFeed,
    consumePrefetchedFeed,
    clearPrefetch,
  };
}
