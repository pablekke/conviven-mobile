import { DataPreloadState } from "./types";

export const CACHE_DURATION = 5 * 60 * 1000;

export const defaultState: DataPreloadState = {
  chats: [],
  chatsLoading: false,
  chatsError: null,
  chatsLastUpdated: null,

  fullProfile: null,
  profileLoading: false,
  profileError: null,
  profileLastUpdated: null,

  searchFilters: null,
  searchFiltersLoading: false,
  searchFiltersError: null,
  searchFiltersLastUpdated: null,

  isPreloading: false,
  preloadCompleted: false,
  preloadError: null,
};
