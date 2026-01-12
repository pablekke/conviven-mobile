import { SearchFilters } from "../../features/profile/services/searchFiltersService";
import { ChatPreview } from "../../features/chat/types";

export interface DataPreloadState {
  chats: ChatPreview[];
  chatsLoading: boolean;
  chatsError: Error | null;
  chatsLastUpdated: number | null;

  fullProfile: any | null;
  profileLoading: boolean;
  profileError: Error | null;
  profileLastUpdated: number | null;

  searchFilters: SearchFilters | null;
  searchFiltersLoading: boolean;
  searchFiltersError: Error | null;
  searchFiltersLastUpdated: number | null;

  isPreloading: boolean;
  preloadCompleted: boolean;
  preloadError: Error | null;
}

export interface DataPreloadContextType extends DataPreloadState {
  refreshChats: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSearchFilters: () => Promise<void>;
  updateSearchFiltersState: (filters: SearchFilters) => void;
  updateChatsState: (updater: (prev: ChatPreview[]) => ChatPreview[]) => void;
  refreshAll: () => Promise<void>;

  clearCache: () => void;
  isDataFresh: (dataType: "chats" | "profile" | "searchFilters", maxAge?: number) => boolean;
}
