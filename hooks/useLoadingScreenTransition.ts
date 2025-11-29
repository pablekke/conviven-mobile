import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDataPreload } from "../context/DataPreloadContext";
import { useFeedPrefetch } from "@/features/feed/hooks";
import { chatService } from "@/features/chat/services";

export interface UseLoadingScreenTransitionReturn {
  showLoading: boolean;
  shouldSlideOut: boolean;
  handleAnimationComplete: () => void;
}

export function useLoadingScreenTransition(): UseLoadingScreenTransitionReturn {
  const { isAuthenticated, isLoading, user, isManualLogin } = useAuth();
  const { refreshChats } = useDataPreload();
  const { prefetchFeed, clearPrefetch } = useFeedPrefetch();

  const [showTransition, setShowTransition] = useState(true);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const [shouldSlideOut, setShouldSlideOut] = useState(false);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [chatsAndMatchesPrefetched, setChatsAndMatchesPrefetched] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !feedLoaded && !isLoading) {
      prefetchFeed()
        .then(() => {
          setFeedLoaded(true);
        })
        .catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando feed:", error);
          setFeedLoaded(true);
        });
    }
  }, [isAuthenticated, user, feedLoaded, isLoading, prefetchFeed]);

  useEffect(() => {
    if (feedLoaded && !chatsAndMatchesPrefetched && isAuthenticated && user) {
      Promise.allSettled([
        refreshChats().catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando chats:", error);
        }),
        chatService.getMatches().catch(error => {
          console.warn("[useLoadingScreenTransition] Error precargando matches:", error);
        }),
      ]).then(() => {
        setChatsAndMatchesPrefetched(true);
        console.log("[useLoadingScreenTransition] Chats y matches precargados en segundo plano");
      });
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
    !isManualLogin &&
    loadingScreenVisible &&
    (isLoading || (isAuthenticated && (!feedLoaded || showTransition)));

  return {
    showLoading,
    shouldSlideOut,
    handleAnimationComplete,
  };
}
