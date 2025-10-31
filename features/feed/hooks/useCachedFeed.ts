import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { feedService } from "../services";
import type { Roomie } from "../types";

const CACHE_KEY = "feed_roomies_cache";
const CACHE_EXPIRY_KEY = "feed_roomies_cache_expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export interface UseCachedFeedReturn {
  roomies: Roomie[];
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export function useCachedFeed(): UseCachedFeedReturn {
  const [roomies, setRoomies] = useState<Roomie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadFromCache = useCallback(async (): Promise<Roomie[] | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const cachedExpiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);

      if (cachedData && cachedExpiry) {
        const expiry = new Date(cachedExpiry);
        if (new Date() < expiry) {
          return JSON.parse(cachedData);
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: Roomie[]) => {
    try {
      const expiry = new Date(Date.now() + CACHE_DURATION);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_EXPIRY_KEY, expiry.toISOString());
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }, []);

  const loadRoomies = useCallback(
    async (useCache = true) => {
      try {
        setIsLoading(true);
        setError(undefined);

        if (useCache) {
          const cachedRoomies = await loadFromCache();
          if (cachedRoomies && cachedRoomies.length > 0) {
            setRoomies(cachedRoomies);
            setIsLoading(false);
            return;
          }
        }

        // Cargar desde API
        const response = await feedService.getMatchingFeed();
        setRoomies(response.items);
        await saveToCache(response.items);
      } catch (error) {
        console.error("Error loading roomies:", error);
        setError("Error al cargar roomies");

        // Fallback a cache si hay error
        const cachedRoomies = await loadFromCache();
        if (cachedRoomies) {
          setRoomies(cachedRoomies);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromCache, saveToCache],
  );

  const refresh = useCallback(async () => {
    await loadRoomies(false);
  }, [loadRoomies]);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, []);

  useEffect(() => {
    loadRoomies();
  }, [loadRoomies]);

  return {
    roomies,
    isLoading,
    error,
    refresh,
    clearCache,
  };
}
