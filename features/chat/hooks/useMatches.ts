import { useDataPreload } from "../../../context/DataPreloadContext";
import { Match } from "../types/chat.types";
import { useMemo } from "react";

export interface UseMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  refreshMatches: () => Promise<void>;
}

export const useMatches = (): UseMatchesReturn => {
  const {
    matches,
    chats,
    matchesLoading: loading,
    matchesError: error,
    refreshMatches,
  } = useDataPreload();

  const computedMatches = useMemo(() => {
    if (!matches) return [];
    const chatUserIds = new Set(chats.map(c => c.id));

    return [...matches]
      .map(m => ({
        ...m,
        hasConversation: chatUserIds.has(m.id),
      }))
      .sort((a, b) => {
        if (!a.hasConversation && b.hasConversation) return -1;
        if (a.hasConversation && !b.hasConversation) return 1;
        return 0;
      });
  }, [matches, chats]);
  const handleRefresh = async (silent = false) => {
    await refreshMatches(silent);
  };

  return {
    matches: computedMatches,
    loading,
    error,
    refreshMatches: () => handleRefresh(false),
  };
};
