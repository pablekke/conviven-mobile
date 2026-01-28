import { createTimeoutPromise } from "../utils";
import { DataPreloadState } from "../types";
import React from "react";
import searchFiltersService, {
  SearchFilters,
} from "../../../features/profile/services/searchFiltersService";

export const loadSearchFiltersAction = async (
  setState: React.Dispatch<React.SetStateAction<DataPreloadState>>,
) => {
  setState(prev => ({ ...prev, searchFiltersLoading: true, searchFiltersError: null }));

  try {
    const timeoutPromise = createTimeoutPromise("Search filters timeout", 10000);

    const searchFilters = (await Promise.race([
      searchFiltersService.getSearchFilters(),
      timeoutPromise,
    ])) as SearchFilters;

    if (!searchFilters) {
      setState(prev => ({
        ...prev,
        searchFiltersLoading: false,
        searchFiltersLastUpdated: Date.now(),
      }));
      return;
    }

    setState(prev => {
      const newLocations = searchFilters.preferredLocations;
      const hasNewLocations = Array.isArray(newLocations) && newLocations.length > 0;

      const prevLocations = prev.searchFilters?.preferredLocations;
      const hasPrevLocations = Array.isArray(prevLocations) && prevLocations.length > 0;

      let finalLocations = newLocations;

      if (!hasNewLocations && hasPrevLocations) {
        finalLocations = prevLocations;
      }

      const mergedFilters = {
        ...searchFilters,
        preferredLocations: finalLocations,
      };

      return {
        ...prev,
        searchFilters: mergedFilters,
        searchFiltersLoading: false,
        searchFiltersError: null,
        searchFiltersLastUpdated: Date.now(),
      };
    });
  } catch (error) {
    // It's normal for new users to not have filters yet.
    // We suppress the error log if it looks like a "Not Found" or 404.
    const errorMessage = error instanceof Error ? error.message : "";
    const isNotFound =
      errorMessage.includes("not found") ||
      errorMessage.includes("no encontrad") ||
      (error as any)?.status === 404;

    if (!isNotFound) {
      console.warn("⚠️ [DataPreload] Error precargando filtros (no crítico):", error);
    }

    setState(prev => ({
      ...prev,
      searchFilters: null,
      searchFiltersLoading: false,
      searchFiltersError: null, // Don't block UI with error for missing filters
      searchFiltersLastUpdated: Date.now(), // Mark as updated so we don't retry immediately
    }));
  }
};
