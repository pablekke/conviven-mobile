import type { MockedBackendUser } from "../mocks/incomingProfile";
import Toast from "react-native-toast-message";
import { FEED_USE_MOCK } from "@/config/env";
import { swipeService } from "../services";
import { useCallback } from "react";

export interface UseFeedSwipeActionsParams {
  primaryBackend: MockedBackendUser | null;
  onAdvance: (direction: "like" | "dislike") => boolean;
  onNoMoreProfiles: () => void;
  onScrollToTop: () => void;
}

export interface UseFeedSwipeActionsReturn {
  handleSwipeComplete: (direction: "like" | "dislike") => void;
}

export function useFeedSwipeActions({
  primaryBackend,
  onAdvance,
  onNoMoreProfiles,
  onScrollToTop,
}: UseFeedSwipeActionsParams): UseFeedSwipeActionsReturn {
  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      if (!FEED_USE_MOCK) {
        const toUserId =
          primaryBackend?.profile?.userId ?? primaryBackend?.filters?.userId ?? undefined;

        if (toUserId) {
          const action = direction === "like" ? "like" : "pass";
          swipeService.createSwipe({ toUserId, action }).catch(() => {
            Toast.show({
              type: "error",
              text1: "No se pudo enviar la acción",
              text2: "Reintentá en unos segundos.",
              position: "bottom",
            });
          });
        } else {
          console.warn("[useFeedSwipeActions] No se pudo resolver toUserId para enviar swipe.");
        }
      }

      onScrollToTop();
      const advanced = onAdvance(direction);
      if (!advanced) {
        onNoMoreProfiles();
      }
    },
    [primaryBackend, onAdvance, onNoMoreProfiles, onScrollToTop],
  );

  return {
    handleSwipeComplete,
  };
}
