import { useDataPreload } from "@/context/DataPreloadContext";
import { MessageStatus } from "../enums";

interface UseMessageStatusUpdatesProps {
  setLastStatusUpdate: (data: any) => void;
}

export const useMessageStatusUpdates = ({ setLastStatusUpdate }: UseMessageStatusUpdatesProps) => {
  const { updateChatsState } = useDataPreload();

  const handleStatusUpdate = (data: any) => {
    const inputId = data.id || data.messageId || data.message_id || data._id;
    const inputConversationId = data.conversationId || data.conversation_id;
    const inputSenderId = data.senderId || data.sender_id;
    const inputStatus = data.status;

    const updateData = {
      messageId: inputId,
      conversationId: inputConversationId,
      status: inputStatus,
      deliveredAt: data.deliveredAt || data.delivered_at || null,
      readAt: data.readAt || data.read_at || null,
      local: data.local || false,
    };

    if (updateData.messageId && updateData.status) {
      setLastStatusUpdate(updateData);

      updateChatsState(prev =>
        prev.map(c => {
          if (c.conversationId === updateData.conversationId || c.id === inputSenderId) {
            return {
              ...c,
              unread: updateData.status === "read" ? 0 : c.unread,
              lastMessageStatus: updateData.status as MessageStatus,
            };
          }
          return c;
        }),
      );
    }
  };

  return { handleStatusUpdate };
};
