import { useCallback, useState, MutableRefObject } from "react";
import { chatService } from "../services";
import { MessageStatus } from "../enums";
import { ChatMessage } from "../types";
import { User } from "@/types/user";

interface UseMessageSenderProps {
  userId: string;
  user: User | null;
  conversationId: string | null;
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  pendingStatusUpdates: MutableRefObject<Map<string, MessageStatus>>;
  updateChatsState: (updater: (prev: any[]) => any[]) => void;
  partnerName?: string;
  partnerAvatar?: string;
  triggerMatchesRefresh?: () => void;
}

export const useMessageSender = ({
  userId,
  user,
  conversationId,
  setConversationId,
  setMessages,
  pendingStatusUpdates,
  updateChatsState,
  partnerName,
  partnerAvatar,
  triggerMatchesRefresh,
}: UseMessageSenderProps) => {
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim() || !user?.id) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversationId: conversationId || "",
        senderId: user.id,
        content: content.trim(),
        status: MessageStatus.PENDING,
        deliveredAt: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date(),
        liked: false,
      };

      try {
        setSending(true);
        setMessages(prev => [optimisticMessage, ...prev]);

        const sentMessage = await chatService.sendMessage(userId, content.trim(), user.id);

        updateChatsState(prev => {
          const index = prev.findIndex(
            c =>
              (sentMessage.conversationId && c.conversationId === sentMessage.conversationId) ||
              c.id === userId,
          );

          if (index === -1) {
            if (!partnerName) return prev;
            if (triggerMatchesRefresh) {
              setTimeout(() => {
                triggerMatchesRefresh();
              }, 0);
            }
            const newChat: any = {
              id: userId,
              conversationId: sentMessage.conversationId,
              name: partnerName,
              avatar:
                partnerAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=2563EB&color=fff&bold=true&size=128`,
              lastMessage: sentMessage.content,
              unread: 0,
              time: "Ahora",
              updatedAt: sentMessage.createdAt,
              lastMessageStatus: sentMessage.status as any,
              lastMessageSenderId: user.id,
            };
            return [newChat, ...prev];
          }

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: sentMessage.content,
            unread: 0,
            updatedAt: sentMessage.createdAt,
            lastMessageStatus: sentMessage.status as any,
            lastMessageSenderId: user.id,
          };

          return updated.sort(
            (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
          );
        });

        setMessages(prev => {
          let finalMessage = sentMessage;
          if (pendingStatusUpdates.current.has(sentMessage.id)) {
            const pendingStatus = pendingStatusUpdates.current.get(sentMessage.id)!;
            finalMessage = { ...sentMessage, status: pendingStatus };
            pendingStatusUpdates.current.delete(sentMessage.id);
          }

          const alreadyExists = prev.some(m => m.id === sentMessage.id);
          if (alreadyExists) {
            return prev.filter(m => m.id !== tempId);
          }

          return prev.map(m => (m.id === tempId ? finalMessage : m));
        });

        if (!conversationId && sentMessage.conversationId) {
          setConversationId(sentMessage.conversationId);
        }
      } catch (err) {
        console.error("Error enviando:", err);
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...m, status: MessageStatus.ERROR } : m)),
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [
      userId,
      user?.id,
      conversationId,
      setConversationId,
      setMessages,
      pendingStatusUpdates,
      updateChatsState,
      partnerName,
      partnerAvatar,
      triggerMatchesRefresh,
    ],
  );

  return {
    sendMessage,
    sending,
  };
};
