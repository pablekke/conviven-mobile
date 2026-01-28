import { useDataPreload } from "../context/DataPreloadContext";
import { useResilience } from "../context/ResilienceContext";
import { useCallback, useEffect, useState } from "react";
import { useFeedPrefetch } from "@/features/feed/hooks";
import { chatService } from "@/features/chat/services";
import { useAuth } from "../context/AuthContext";

export interface UseLoadingScreenTransitionReturn {
  showLoading: boolean;
  shouldSlideOut: boolean;
  handleAnimationComplete: () => void;
}

export function useLoadingScreenTransition(): UseLoadingScreenTransitionReturn {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { refreshChats } = useDataPreload();
  const { prefetchFeed, clearPrefetch } = useFeedPrefetch();
  const { triggerStartupError } = useResilience();

  const [showTransition, setShowTransition] = useState(true);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const [shouldSlideOut, setShouldSlideOut] = useState(false);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [chatsAndMatchesPrefetched, setChatsAndMatchesPrefetched] = useState(false);

  useEffect(() => {
    // Check if user has filters before prefetching. If not, they are in onboarding and don't need feed yet.
    const hasFilters = user?.filters && Object.keys(user.filters).length > 0;

    if (isAuthenticated && user && hasFilters && !feedLoaded && !isLoading) {
      prefetchFeed()
        .then(() => {
          setFeedLoaded(true);
        })
        .catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando feed:", error);
          // Only trigger startup error if we really expected this to work
          if (hasFilters) {
            triggerStartupError();
          }
        });
    } else if (isAuthenticated && user && !hasFilters) {
      // If no filters, we consider feed "loaded" (skipped) so we can transition to onboarding
      setFeedLoaded(true);
    }
  }, [isAuthenticated, user, feedLoaded, isLoading, prefetchFeed, triggerStartupError]);

  useEffect(() => {
    const hasFilters = user?.filters && Object.keys(user.filters).length > 0;

    if (feedLoaded && !chatsAndMatchesPrefetched && isAuthenticated && user && hasFilters) {
      Promise.allSettled([
        refreshChats().catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando chats:", error);
        }),
        chatService.getMatches().catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando matches:", error);
        }),
      ]).then(() => {
        setChatsAndMatchesPrefetched(true);
      });
    } else if (feedLoaded && !chatsAndMatchesPrefetched && isAuthenticated && user && !hasFilters) {
      setChatsAndMatchesPrefetched(true);
    }
  }, [feedLoaded, chatsAndMatchesPrefetched, isAuthenticated, user, refreshChats]);

  useEffect(() => {
    if (isAuthenticated && user && !feedLoaded) {
      setLoadingScreenVisible(true);
      setShowTransition(true);
      setShouldSlideOut(false);
    }
  }, [isAuthenticated, user, feedLoaded]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearPrefetch();
      setFeedLoaded(false);
      setShouldSlideOut(false);
      setLoadingScreenVisible(true);
      setShowTransition(true);
      setChatsAndMatchesPrefetched(false);
    }
  }, [isAuthenticated, clearPrefetch]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && feedLoaded && showTransition && !shouldSlideOut) {
      const timer = setTimeout(() => {
        setShouldSlideOut(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, feedLoaded, showTransition, shouldSlideOut]);

  const handleAnimationComplete = useCallback(() => {
    setLoadingScreenVisible(false);
    setShowTransition(false);
  }, []);

  const showLoading =
    loadingScreenVisible && (isLoading || (isAuthenticated && (!feedLoaded || showTransition)));

  return {
    showLoading,
    shouldSlideOut,
    handleAnimationComplete,
  };
}
