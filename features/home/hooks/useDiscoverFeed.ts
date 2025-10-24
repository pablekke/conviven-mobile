import { useCallback, useEffect, useState } from "react";

import { DISCOVER_CONSTANTS } from "../constants";
import { discoverService } from "../services";
import { DiscoverCandidate } from "../types";

export interface UseDiscoverFeedReturn {
  candidates: DiscoverCandidate[];
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  enrichCandidate: (userId: string) => Promise<void>;
  swipe: (toUserId: string, action: "like" | "pass") => Promise<void>;
}

export const useDiscoverFeed = (): UseDiscoverFeedReturn => {
  const [candidates, setCandidates] = useState<DiscoverCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextPage, setNextPage] = useState<number | null>(1);

  const loadPage = useCallback(async (page: number, replace: boolean = false) => {
    try {
      if (replace) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }
      setError(null);

      const { candidates: pageCandidates, nextPage: incomingNext } =
        await discoverService.getMatching(page, DISCOVER_CONSTANTS.PAGE_SIZE);

      setCandidates(prev => (replace ? pageCandidates : [...prev, ...pageCandidates]));
      setNextPage(incomingNext ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar Discover"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (nextPage) {
      await loadPage(nextPage);
    }
  }, [nextPage, loadPage]);

  // Enriquecer cuando la tarjeta actual está en foco
  const enrichCandidate = useCallback(async (userId: string) => {
    try {
      const details = await discoverService.getUserDetails(userId);
      const fullName = `${details.firstName ?? ""} ${details.lastName ?? ""}`.trim();
      setCandidates(prev =>
        prev.map(c =>
          c.id === userId
            ? {
                ...c,
                name: fullName || c.name,
                photoUrl: details.photoUrl ?? c.photoUrl,
                bio: details.profile?.bio ?? c.bio,
              }
            : c,
        ),
      );
    } catch {}
  }, []);

  const swipe = useCallback(async (toUserId: string, action: "like" | "pass") => {
    try {
      await discoverService.swipe(toUserId, action);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al registrar swipe"));
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  // Auto refresh interval
  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, DISCOVER_CONSTANTS.REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  return { candidates, loading, error, refreshing, loadMore, refresh, enrichCandidate, swipe };
};
