import { useCallback, useState } from "react";
import { chatService } from "../services";
import { MessageStatus } from "../enums";
import { ChatMessage } from "../types";
import { User } from "@/types/user";

interface UseChatMessagesProps {
  userId: string;
  user: User | null;
  markConversationAsRead: (conversationId: string) => void;
}

export const useChatMessages = ({ userId, user, markConversationAsRead }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMessages = useCallback(
    async (forceRefresh = false, silent = false, markRead = true) => {
      if (!userId) return;

      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const fetchedMessages = await chatService.getMessages(userId, forceRefresh);
        const sortedMessages = fetchedMessages.reverse();

        setMessages(sortedMessages);

        if (fetchedMessages.length > 0) {
          const foundId = fetchedMessages[0].conversationId;
          setConversationId(foundId);
          setHasMore(fetchedMessages.length >= 20);
          const hasUnread = fetchedMessages.some(
            m => m.senderId !== user?.id && m.status !== MessageStatus.READ,
          );

          if (hasUnread && markRead) {
            chatService.markAllAsRead(userId).catch(() => {});
            if (foundId) markConversationAsRead(foundId);
          }
        }
      } catch (err) {
        if (!silent) setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [userId, user?.id, markConversationAsRead],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !conversationId) return;

    try {
      setIsLoadingMore(true);
      const oldestMsg = messages[messages.length - 1];

      if (!oldestMsg) return;

      const response = await chatService.getPaginatedMessages(conversationId, 50, oldestMsg.id);
      let newMessages: ChatMessage[] = [];
      let newHasMore = false;

      if (Array.isArray(response.messages)) {
        newMessages = response.messages;
        newHasMore = response.hasMore;
      } else if (Array.isArray(response)) {
        newMessages = response as any[];
      }

      if (newMessages.length > 0) {
        const mapped = newMessages.reverse().map(msg => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));

        setMessages(prev => [...prev, ...mapped]);
        setHasMore(newHasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, conversationId, messages]);

  return {
    messages,
    setMessages,
    loading,
    error,
    conversationId,
    setConversationId,
    hasMore,
    isLoadingMore,
    loadMessages,
    loadMore,
  };
};
