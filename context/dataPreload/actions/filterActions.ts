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
    const timeoutPromise = createTimeoutPromise("Search filters timeout", 5000);

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
      const prevParams = prev.searchFilters as any;
      const prevLocations = prevParams?.preferredLocations;
      const prevNeighborhoods = prev.searchFilters?.preferredLocations;

      const hasPrevLocations = Array.isArray(prevLocations) && prevLocations.length > 0;
      const hasPrevNeighborhoods = Array.isArray(prevNeighborhoods) && prevNeighborhoods.length > 0;

      const newParams = searchFilters as any;
      const newLocations = newParams.preferredLocations;
      const newNeighborhoods = searchFilters.preferredLocations;

      const hasNewLocations = Array.isArray(newLocations) && newLocations.length > 0;
      const hasNewNeighborhoods =
        Array.isArray(newNeighborhoods) && (newNeighborhoods as any[]).length > 0;

      const apiHasData = hasNewLocations || hasNewNeighborhoods;

      let finalPreferredLocations = newLocations;
      let finalpreferredLocations = newNeighborhoods;

      if (!apiHasData) {
        if (hasPrevLocations) {
          finalPreferredLocations = prevLocations;
        }
        if (hasPrevNeighborhoods) {
          finalpreferredLocations = prevNeighborhoods;
        }
      }

      const mergedFilters = {
        ...searchFilters,
        preferredLocations: finalPreferredLocations,
        preferredLocations: finalpreferredLocations,
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
    console.error("Error precargando filtros de búsqueda:", error);
    setState(prev => ({
      ...prev,
      searchFilters: null,
      searchFiltersLoading: false,
      searchFiltersError: error instanceof Error ? error : new Error("Error desconocido"),
      searchFiltersLastUpdated: null,
    }));
  }
};
