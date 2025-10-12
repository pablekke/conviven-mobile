import { useCallback, useEffect, useState } from "react";

import { chatService } from "../services";
import { ChatMessage } from "../types";

export interface UseChatConversationReturn {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

/**
 * Hook para manejar la conversación con un usuario específico
 *
 * @param userId - UUID del otro usuario en la conversación
 * @returns Estado y funciones para manejar la conversación
 */
export const useChatConversation = (userId: string): UseChatConversationReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMessages = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedMessages = await chatService.getMessages(userId);
      setMessages(fetchedMessages);
      if (fetchedMessages.length > 0) {
        chatService.markAllAsRead(userId).catch(err => {
          console.error("Error al marcar mensajes como leídos:", err);
        });
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim()) {
        return;
      }

      try {
        setSending(true);
        setError(null);

        const newMessage = await chatService.sendMessage(userId, content.trim());

        setMessages(prev => [...prev, newMessage]);
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
        setError(err instanceof Error ? err : new Error("Error al enviar mensaje"));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [userId],
  );

  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refreshMessages,
  };
};
