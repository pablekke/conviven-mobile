import type { MockedBackendUser } from "../mocks/incomingProfile";
import { useChat } from "../../chat/context/ChatContext";
import Toast from "react-native-toast-message";
import { FEED_USE_MOCK } from "@/config/env";
import { swipeService } from "../services";
import { useCallback } from "react";

const DEBUG_FORCE_MATCH = false;

export interface UseFeedSwipeActionsParams {
  primaryBackend: MockedBackendUser | null;
  onAdvance: (direction: "like" | "dislike") => boolean;
  onNoMoreProfiles: () => void;
  onScrollToTop: () => void;
  onMatch?: (profile: MockedBackendUser) => void;
}

export interface UseFeedSwipeActionsReturn {
  handleSwipeComplete: (direction: "like" | "dislike") => void;
}

export function useFeedSwipeActions({
  primaryBackend,
  onAdvance,
  onNoMoreProfiles,
  onScrollToTop,
  onMatch,
}: UseFeedSwipeActionsParams): UseFeedSwipeActionsReturn {
  const { triggerMatchesRefresh } = useChat();

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      if (!FEED_USE_MOCK) {
        const toUserId =
          primaryBackend?.userId ??
          primaryBackend?.profile?.userId ??
          primaryBackend?.filters?.userId ??
          undefined;

        if (toUserId) {
          const action = direction === "like" ? "like" : "pass";

          // Si estamos forzando match, lo disparamos inmediatamente para una respuesta instantánea
          if (DEBUG_FORCE_MATCH && action === "like" && onMatch && primaryBackend) {
            onMatch(primaryBackend);
          }

          swipeService
            .createSwipe({
              toUserId,
              action,
            })
            .then(response => {
              if (response && response.isMatch) {
                triggerMatchesRefresh();

                if (!DEBUG_FORCE_MATCH && action === "like" && onMatch && primaryBackend) {
                  onMatch(primaryBackend);
                }
              }
            })
            .catch(err => {
              console.error("❌ [SwipeHook Error]", err);
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
      } else {
        const isMatchMock = Math.random() > 0.7 || DEBUG_FORCE_MATCH;
        if (direction === "like" && isMatchMock && onMatch && primaryBackend) {
          onMatch(primaryBackend);
        }
      }

      onScrollToTop();
      triggerMatchesRefresh();

      const advanced = onAdvance(direction);
      if (!advanced) {
        onNoMoreProfiles();
      }
    },
    [primaryBackend, onAdvance, onNoMoreProfiles, onScrollToTop, onMatch, triggerMatchesRefresh],
  );

  return {
    handleSwipeComplete,
  };
}
