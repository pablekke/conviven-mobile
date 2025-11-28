import { useCallback } from "react";

import { FEED_USE_MOCK } from "@/config/env";
import type { PrefetchedFeedPayload } from "./useFeedPrefetch";
import { useFeedPrefetch } from "./useFeedPrefetch";

type HydratorOptions = {
  invalidate?: boolean;
};

export function useFeedPrefetchHydrator() {
  const { consumePrefetchedFeed } = useFeedPrefetch();

  const hydratePrefetchedFeed = useCallback(
    (options: HydratorOptions = {}): PrefetchedFeedPayload | null => {
      if (FEED_USE_MOCK) {
        return null;
      }

      const invalidate = options.invalidate ?? true;
      return consumePrefetchedFeed({ invalidate }) ?? null;
    },
    [consumePrefetchedFeed],
  );

  return {
    hydratePrefetchedFeed,
  };
}
