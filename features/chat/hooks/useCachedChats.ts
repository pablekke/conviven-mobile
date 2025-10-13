import { useCallback } from "react";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { ChatPreview } from "../types";

export interface UseCachedChatsReturn {
  chats: ChatPreview[];
  loading: boolean;
  error: Error | null;
  refreshChats: () => Promise<void>;
  isDataFresh: boolean;
}

/**
 * Hook optimizado que usa el cache del DataPreloadContext
 * Los datos se precargan al iniciar la app, por lo que este hook
 * devuelve inmediatamente los datos cached sin loading extra
 */
export const useCachedChats = (): UseCachedChatsReturn => {
  const {
    chats,
    chatsLoading: loading,
    chatsError: error,
    refreshChats,
    isDataFresh,
  } = useDataPreload();

  const handleRefresh = useCallback(async () => {
    await refreshChats();
  }, [refreshChats]);

  const dataIsFresh = isDataFresh("chats");

  return {
    chats,
    loading,
    error,
    refreshChats: handleRefresh,
    isDataFresh: dataIsFresh,
  };
};
