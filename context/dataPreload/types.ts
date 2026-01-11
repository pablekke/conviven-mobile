import { SearchFilters } from "../../features/profile/services/searchFiltersService";
import { ChatPreview, Match } from "../../features/chat/types";
import { User } from "../../types/user";

export interface DataPreloadState {
  chats: ChatPreview[];
  chatsLoading: boolean;
  chatsError: Error | null;
  chatsLastUpdated: number | null;

  fullProfile: User | null;
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

  matches: Match[];
  matchesLoading: boolean;
  matchesError: Error | null;
  matchesLastUpdated: number | null;
}

export interface DataPreloadContextType extends DataPreloadState {
  refreshChats: (silent?: boolean) => Promise<void>;
  refreshMatches: (silent?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSearchFilters: () => Promise<void>;
  updateSearchFiltersState: (filters: SearchFilters) => void;
  refreshAll: () => Promise<void>;

  clearCache: () => void;
  isDataFresh: (dataType: "chats" | "profile" | "searchFilters", maxAge?: number) => boolean;
}
