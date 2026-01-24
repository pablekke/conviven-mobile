import { useDataPreload } from "@/context/DataPreloadContext";
import { MutableRefObject } from "react";
import { ChatMessage } from "../types";

interface UseIncomingMessagesProps {
  setLastMessage: (message: ChatMessage) => void;
  handleNewConversation: () => void;
  activeChatIdRef: MutableRefObject<string | null>;
  userId: string;
}

export const useIncomingMessages = ({
  setLastMessage,
  handleNewConversation,
  activeChatIdRef,
  userId,
}: UseIncomingMessagesProps) => {
  const { updateChatsState } = useDataPreload();

  const normalizeMessageContent = (content: any): string => {
    if (typeof content === "object") {
      if (content.content && typeof content.content === "string") {
        return content.content;
      }
      return JSON.stringify(content);
    }
    return typeof content === "string" ? content : JSON.stringify(content);
  };

  const handleIncomingMessage = (data: any) => {
    const inputId = data.id || data.messageId || data.message_id || data._id;
    const inputConversationId = data.conversationId || data.conversation_id;
    const inputSenderId = data.senderId || data.sender_id;
    const inputContent = data.content;
    const inputStatus = data.status;

    const normalizedMsg: ChatMessage = {
      id: inputId,
      conversationId: inputConversationId,
      senderId: inputSenderId,
      content: normalizeMessageContent(inputContent),
      createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      status: inputStatus || "sent",
      deliveredAt: data.deliveredAt || data.delivered_at || null,
      readAt: data.readAt || data.read_at || null,
      updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
      liked: !!data.liked,
      timestamp: new Date(),
    };

    setLastMessage(normalizedMsg);

    updateChatsState(prev => {
      const index = prev.findIndex(
        c =>
          (normalizedMsg.conversationId && c.conversationId === normalizedMsg.conversationId) ||
          c.id === normalizedMsg.senderId,
      );

      if (index === -1) {
        handleNewConversation();
        return prev;
      }

      const updated = [...prev];
      const chat = updated[index];

      const isTargetActive =
        activeChatIdRef.current === chat.conversationId || activeChatIdRef.current === chat.id;

      updated[index] = {
        ...chat,
        lastMessage: normalizedMsg.content,
        unread: normalizedMsg.senderId !== userId && !isTargetActive ? chat.unread + 1 : 0,
        updatedAt: normalizedMsg.createdAt,
        lastMessageStatus: normalizedMsg.status as any,
        lastMessageSenderId: normalizedMsg.senderId,
      };

      return updated.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
      );
    });
  };

  return { handleIncomingMessage };
};
