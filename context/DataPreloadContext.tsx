import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import { ChatPreview } from "../features/chat/types";
import { chatService } from "../features/chat/services";
import UserProfileService from "../services/userProfileService";
import { useAuth } from "./AuthContext";

interface DataPreloadState {
  // Chat data
  chats: ChatPreview[];
  chatsLoading: boolean;
  chatsError: Error | null;
  chatsLastUpdated: number | null;

  // Profile data
  fullProfile: any | null;
  profileLoading: boolean;
  profileError: Error | null;
  profileLastUpdated: number | null;

  // General preload state
  isPreloading: boolean;
  preloadCompleted: boolean;
  preloadError: Error | null;
}

interface DataPreloadContextType extends DataPreloadState {
  // Refresh functions
  refreshChats: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Cache management
  clearCache: () => void;
  isDataFresh: (dataType: "chats" | "profile", maxAge?: number) => boolean;
}

const defaultState: DataPreloadState = {
  chats: [],
  chatsLoading: false,
  chatsError: null,
  chatsLastUpdated: null,

  fullProfile: null,
  profileLoading: false,
  profileError: null,
  profileLastUpdated: null,

  isPreloading: false,
  preloadCompleted: false,
  preloadError: null,
};

const DataPreloadContext = createContext<DataPreloadContextType>({
  ...defaultState,
  refreshChats: async () => {},
  refreshProfile: async () => {},
  refreshAll: async () => {},
  clearCache: () => {},
  isDataFresh: () => false,
});

interface DataPreloadProviderProps {
  children: ReactNode;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const DataPreloadProvider: React.FC<DataPreloadProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<DataPreloadState>(defaultState);

  // Check if data is fresh (within cache duration)
  const isDataFresh = useCallback(
    (dataType: "chats" | "profile", maxAge: number = CACHE_DURATION): boolean => {
      const lastUpdated = dataType === "chats" ? state.chatsLastUpdated : state.profileLastUpdated;
      if (!lastUpdated) return false;
      return Date.now() - lastUpdated < maxAge;
    },
    [state.chatsLastUpdated, state.profileLastUpdated],
  );

  // Load chats
  const loadChats = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    setState(prev => ({ ...prev, chatsLoading: true, chatsError: null }));

    try {
      const conversations = await chatService.getConversations();

      setState(prev => ({
        ...prev,
        chats: conversations,
        chatsLoading: false,
        chatsError: null,
        chatsLastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error("Error precargando chats:", error);
      setState(prev => ({
        ...prev,
        chats: [],
        chatsLoading: false,
        chatsError: error instanceof Error ? error : new Error("Error desconocido"),
        chatsLastUpdated: null,
      }));
    }
  }, [user, isAuthenticated]);

  // Load full profile
  const loadProfile = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    setState(prev => ({ ...prev, profileLoading: true, profileError: null }));

    try {
      const fullProfile = await UserProfileService.getFullUserProfile();

      setState(prev => ({
        ...prev,
        fullProfile,
        profileLoading: false,
        profileError: null,
        profileLastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error("Error precargando perfil:", error);
      setState(prev => ({
        ...prev,
        fullProfile: null,
        profileLoading: false,
        profileError: error instanceof Error ? error : new Error("Error desconocido"),
        profileLastUpdated: null,
      }));
    }
  }, [user, isAuthenticated]);

  // Preload all data
  const preloadAllData = useCallback(async () => {
    if (!user || !isAuthenticated || authLoading) return;

    setState(prev => ({
      ...prev,
      isPreloading: true,
      preloadError: null,
      preloadCompleted: false,
    }));

    try {
      // Load data in parallel for better performance
      await Promise.allSettled([loadChats(), loadProfile()]);

      setState(prev => ({
        ...prev,
        isPreloading: false,
        preloadCompleted: true,
        preloadError: null,
      }));
    } catch (error) {
      console.error("Error en precarga general:", error);
      setState(prev => ({
        ...prev,
        isPreloading: false,
        preloadCompleted: false,
        preloadError: error instanceof Error ? error : new Error("Error en precarga"),
      }));
    }
  }, [user, isAuthenticated, authLoading, loadChats, loadProfile]);

  // Refresh functions
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const refreshAll = useCallback(async () => {
    await preloadAllData();
  }, [preloadAllData]);

  // Clear cache
  const clearCache = useCallback(() => {
    setState(defaultState);
  }, []);

  // Auto-preload when user becomes available
  useEffect(() => {
    if (user && isAuthenticated && !authLoading) {
      preloadAllData();
    }
  }, [user, isAuthenticated, authLoading, preloadAllData]);

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearCache();
    }
  }, [isAuthenticated, clearCache]);

  const contextValue: DataPreloadContextType = {
    ...state,
    refreshChats,
    refreshProfile,
    refreshAll,
    clearCache,
    isDataFresh,
  };

  return <DataPreloadContext.Provider value={contextValue}>{children}</DataPreloadContext.Provider>;
};

export const useDataPreload = (): DataPreloadContextType => {
  const context = useContext(DataPreloadContext);
  if (!context) {
    throw new Error("useDataPreload must be used within a DataPreloadProvider");
  }
  return context;
};

export default DataPreloadProvider;
