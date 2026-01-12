import { DataPreloadState, DataPreloadContextType } from "./dataPreload/types";
import { defaultState, CACHE_DURATION } from "./dataPreload/constants";
import { usePreloadActions } from "./dataPreload/usePreloadActions";
import { ChatPreview } from "@/features/chat/types"; 
import { useAuth } from "./AuthContext";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";

const DataPreloadContext = createContext<DataPreloadContextType>({
  ...defaultState,
  refreshChats: async () => {},
  refreshProfile: async () => {},
  refreshSearchFilters: async () => {},
  updateSearchFiltersState: () => {},
  updateChatsState: () => {},
  refreshAll: async () => {},
  clearCache: () => {},
  isDataFresh: () => false,
});

interface DataPreloadProviderProps {
  children: ReactNode;
}

export const DataPreloadProvider: React.FC<DataPreloadProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<DataPreloadState>(defaultState);
  const lastPreloadedUserIdRef = useRef<string | null>(null);

  const { loadChats, loadProfile, loadSearchFilters, preloadAllData } = usePreloadActions(
    setState,
    user,
    isAuthenticated,
    authLoading,
  );

  const isDataFresh = useCallback(
    (dataType: "chats" | "profile" | "searchFilters", maxAge: number = CACHE_DURATION): boolean => {
      let lastUpdated;
      if (dataType === "chats") lastUpdated = state.chatsLastUpdated;
      else if (dataType === "profile") lastUpdated = state.profileLastUpdated;
      else lastUpdated = state.searchFiltersLastUpdated;

      if (!lastUpdated) return false;
      return Date.now() - lastUpdated < maxAge;
    },
    [state.chatsLastUpdated, state.profileLastUpdated, state.searchFiltersLastUpdated],
  );

  const refreshChats = useCallback(async () => {
    await loadChats(true);
  }, [loadChats]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const refreshSearchFilters = useCallback(async () => {
    await loadSearchFilters();
  }, [loadSearchFilters]);

  const updateSearchFiltersState = useCallback((filters: any) => {
    setState(prev => ({
      ...prev,
      searchFilters: filters,
      searchFiltersLastUpdated: Date.now(),
    }));
  }, []);

  const updateChatsState = useCallback((updater: (prev: ChatPreview[]) => ChatPreview[]) => {
    setState(prev => ({
      ...prev,
      chats: updater(prev.chats),
      chatsLastUpdated: Date.now(),
    }));
  }, []);

  const refreshAll = useCallback(async () => {
    await preloadAllData();
  }, [preloadAllData]);

  const clearCache = useCallback(() => {
    setState(defaultState);
  }, []);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (!userId || !isAuthenticated || authLoading) {
      return;
    }
    if (lastPreloadedUserIdRef.current !== userId) {
      lastPreloadedUserIdRef.current = userId;
      preloadAllData();
    }
  }, [user?.id, isAuthenticated, authLoading, preloadAllData]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCache();
      lastPreloadedUserIdRef.current = null;
    }
  }, [isAuthenticated, clearCache]);

  const contextValue: DataPreloadContextType = {
    ...state,
    refreshChats,
    refreshProfile,
    refreshSearchFilters,
    updateSearchFiltersState,
    updateChatsState,
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
