import { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";

import { chatService } from "../services";
import { Match } from "../types/chat.types";

export interface UseMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  refreshMatches: () => Promise<void>;
}

export const useMatches = (): UseMatchesReturn => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const matchesData = await chatService.getMatches();
      setMatches(matchesData);

      const avatarUrls = matchesData
        .map(match => match.avatar)
        .filter(
          (url): url is string => !!url && url.trim().length > 0 && !url.includes("ui-avatars.com"),
        );

      Promise.allSettled(avatarUrls.map(url => Image.prefetch(url).catch(() => {}))).catch(
        () => {},
      );
    } catch (err) {
      console.error("Error al cargar matches:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMatches = useCallback(async () => {
    await loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    loading,
    error,
    refreshMatches,
  };
};
