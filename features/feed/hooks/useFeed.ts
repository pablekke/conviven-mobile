import { useState, useEffect, useCallback, useMemo } from "react";
import { feedService } from "../services";
import { FEED_CONSTANTS } from "../constants";
import { MatchActionType } from "../../../core/enums";
import type { Roomie } from "../types";
import { FeedState, MatchAction } from "../types/feed.types";

export interface UseFeedReturn {
  roomies: Roomie[];
  currentIndex: number;
  isLoading: boolean;
  hasMore: boolean;
  error?: string;
  activeRoomie?: Roomie;
  nextRoomie?: Roomie;
  handleChoice: (action: MatchActionType) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeed(): UseFeedReturn {
  const [state, setState] = useState<FeedState>({
    currentIndex: 0,
    roomies: [],
    isLoading: true,
    hasMore: true,
  });

  const activeRoomie = useMemo(
    () => state.roomies[state.currentIndex],
    [state.roomies, state.currentIndex],
  );

  const nextRoomie = useMemo(
    () => state.roomies[state.currentIndex + 1],
    [state.roomies, state.currentIndex],
  );

  const loadRoomies = useCallback(async (page = 1, reset = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      const response = await feedService.getMatchingFeed(page, FEED_CONSTANTS.ROOMIES_PER_PAGE);

      setState(prev => ({
        ...prev,
        roomies: reset ? response.items : [...prev.roomies, ...response.items],
        hasMore: response.hasNext,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Error al cargar roomies",
      }));
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;

    const nextPage = Math.floor(state.roomies.length / FEED_CONSTANTS.ROOMIES_PER_PAGE) + 1;
    await loadRoomies(nextPage, false);
  }, [state.isLoading, state.hasMore, state.roomies.length, loadRoomies]);

  const handleChoice = useCallback(
    async (action: MatchActionType) => {
      if (!activeRoomie) return;

      const matchAction: MatchAction = {
        type: action,
        roomieId: activeRoomie.id,
        timestamp: new Date(),
      };

      try {
        const result = await feedService.sendMatchAction(matchAction);

        if (result.success) {
          // Avanzar al siguiente roomie
          setState(prev => {
            const newIndex = prev.currentIndex + 1;

            // Si no hay más roomies, cargar más
            if (newIndex >= prev.roomies.length - 1 && prev.hasMore) {
              // Cargar más roomies de forma asíncrona
              setTimeout(() => {
                const nextPage =
                  Math.floor(prev.roomies.length / FEED_CONSTANTS.ROOMIES_PER_PAGE) + 1;
                loadRoomies(nextPage, false);
              }, 0);
            }

            return {
              ...prev,
              currentIndex: newIndex,
            };
          });
        }
      } catch (error) {
        console.error("Error sending match action:", error);
      }
    },
    [activeRoomie, loadRoomies],
  );

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, currentIndex: 0 }));
    await loadRoomies(1, true);
  }, [loadRoomies]);

  useEffect(() => {
    loadRoomies(1, true);
  }, [loadRoomies]);

  return {
    roomies: state.roomies,
    currentIndex: state.currentIndex,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    error: state.error,
    activeRoomie,
    nextRoomie,
    handleChoice,
    loadMore,
    refresh,
  };
}
