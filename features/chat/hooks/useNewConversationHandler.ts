import { useDataPreload } from "@/context/DataPreloadContext";
import chatService from "../services/chatService";
import { useCallback, useRef } from "react";

export const useNewConversationHandler = () => {
  const { updateChatsState } = useDataPreload();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNewConversation = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    console.log("Nueva conversación detectada, refrescando lista de chats...");

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const freshConversations = await chatService.getConversations();
        updateChatsState(() => freshConversations);
      } catch (error) {
        console.error("Error al refrescar conversaciones:", error);
      }
    }, 500);
  }, [updateChatsState]);

  return { handleNewConversation };
};
