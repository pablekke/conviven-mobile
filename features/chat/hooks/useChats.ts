import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "../context/ChatContext";

import { chatService } from "../services";
import { ChatPreview } from "../types";
import { MessageStatus } from "../enums";

export interface UseChatsReturn {
  chats: ChatPreview[];
  loading: boolean;
  error: Error | null;
  refreshChats: () => Promise<void>;
}

export const useChats = (): UseChatsReturn => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();
  const { lastMessage, lastStatusUpdate } = useChat();
  const lastProcessedId = useRef<string | null>(null);
  const lastProcessedStatusId = useRef<string | null>(null);

  const loadChats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const hasFilters = user.filters && Object.keys(user.filters).length > 0;
    if (!hasFilters) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const conversations = await chatService.getConversations();
      setChats(conversations);
    } catch (err) {
      console.error("Error al cargar chats:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!lastMessage || !user) return;

    if (lastMessage.id === lastProcessedId.current) return;
    lastProcessedId.current = lastMessage.id;

    setChats(prev => {
      let index = prev.findIndex(c => c.conversationId === lastMessage.conversationId);
      if (index === -1) index = prev.findIndex(c => c.id === lastMessage.senderId);

      if (lastMessage.senderId === user.id) {
        refreshChats().catch(() => {});
        return prev;
      }

      if (index === -1) {
        refreshChats().catch(() => {});
        return prev;
      }

      const updatedChats = [...prev];
      updatedChats[index] = {
        ...updatedChats[index],
        lastMessage: lastMessage.content,
        time: "Ahora",
        unread: updatedChats[index].unread + 1,
        updatedAt: lastMessage.createdAt || new Date().toISOString(),
        lastMessageStatus: lastMessage.status,
      };

      return updatedChats.sort((a, b) => {
        const da = new Date(a.updatedAt || 0).getTime();
        const db = new Date(b.updatedAt || 0).getTime();
        return db - da;
      });
    });
  }, [lastMessage, user, refreshChats]);

  // B. Manejo de estados/vistos (Socket)
  useEffect(() => {
    if (!lastStatusUpdate) return;

    // Dedup si es status individual, para ALL usamos un timestamp o similar?
    // Usamos messageId como key de dedup si existe
    const dedupKey = `${lastStatusUpdate.conversationId}-${lastStatusUpdate.messageId}-${lastStatusUpdate.status}`;
    if (dedupKey === lastProcessedStatusId.current) return;
    lastProcessedStatusId.current = dedupKey;

    if (lastStatusUpdate.status === "read" || lastStatusUpdate.status === MessageStatus.READ) {
      setChats(prev => {
        const updated = prev.map(chat => {
          // Si es un "visto" general de la conversación
          if (
            chat.conversationId === lastStatusUpdate.conversationId ||
            chat.id === lastStatusUpdate.senderId // Fallback si no hay convoId
          ) {
            return { ...chat, unread: 0 };
          }
          return chat;
        });
        return updated;
      });
    }
  }, [lastStatusUpdate]);

  return {
    chats,
    loading,
    error,
    refreshChats,
  };
};
