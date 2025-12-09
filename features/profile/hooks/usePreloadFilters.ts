import { searchFiltersService, searchPreferencesService } from "../services";
import type { SearchFilters } from "../services/searchFiltersService";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { getCachedValue } from "../../../services/resilience/cache";
import type { SearchPreferences } from "../interfaces";
import { useAuth } from "../../../context/AuthContext";
import { useCallback } from "react";

export const usePreloadFilters = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshProfile } = useDataPreload();

  const preloadFilters = useCallback(async (): Promise<void> => {
    if (!user || !isAuthenticated) {
      return;
    }

    const preloadPromises: Promise<void>[] = [];

    preloadPromises.push(
      getCachedValue<SearchFilters>("/search-filters/me").then(async cachedFilters => {
        if (!cachedFilters) {
          await searchFiltersService.getSearchFilters().catch(() => {});
        }
      }),
    );

    preloadPromises.push(
      getCachedValue<SearchPreferences>("/search-preferences/me").then(async cachedPreferences => {
        if (!cachedPreferences) {
          await searchPreferencesService.getSearchPreferences().catch(() => {});
        }
      }),
    );

    preloadPromises.push(refreshProfile().catch(() => {}));

    Promise.allSettled(preloadPromises).catch(() => {});
  }, [user, isAuthenticated, refreshProfile]);

  return { preloadFilters };
};
