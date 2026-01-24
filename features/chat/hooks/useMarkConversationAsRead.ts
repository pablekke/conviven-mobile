import { useDataPreload } from "@/context/DataPreloadContext";
import { useCallback } from "react";

export const useMarkConversationAsRead = (setLastStatusUpdate: (data: any) => void) => {
  const { updateChatsState } = useDataPreload();

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      const updateData = {
        messageId: "ALL",
        conversationId,
        status: "read",
        local: true,
      };
      setLastStatusUpdate(updateData);

      updateChatsState(prev =>
        prev.map(c =>
          c.conversationId === conversationId || c.id === conversationId ? { ...c, unread: 0 } : c,
        ),
      );
    },
    [updateChatsState, setLastStatusUpdate],
  );

  return { markConversationAsRead };
};
