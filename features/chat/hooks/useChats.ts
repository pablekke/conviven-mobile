import { useCallback, useEffect, useState } from "react";

import { chatService } from "../services";
import { ChatPreview } from "../types";

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

  const loadChats = useCallback(async () => {
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

  return {
    chats,
    loading,
    error,
    refreshChats,
  };
};
