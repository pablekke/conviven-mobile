import { getCachedNeighborhood, neighborhoodsCacheService } from "../services";
import { useNeighborhoodsList } from "./useNeighborhoodsList";
import { useEffect, useState, useMemo } from "react";

interface UseAdditionalNeighborhoodsSelectionProps {
  visible: boolean;
  selectedNeighborhoodIds: string[];
  mainNeighborhoodId?: string | null;
  excludeNeighborhoodIds?: string[];
  cachedFilters?: any | null;
  cityId?: string;
}

export const useAdditionalNeighborhoodsSelection = ({
  visible,
  selectedNeighborhoodIds,
  mainNeighborhoodId,
  excludeNeighborhoodIds = [],
  cachedFilters,
  cityId,
}: UseAdditionalNeighborhoodsSelectionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNeighborhoodIds);
  const [searchQuery, setSearchQuery] = useState("");

  const mainCityId = useMemo(() => {
    if (cityId) return cityId;

    if (mainNeighborhoodId && visible) {
      const neighborhood = getCachedNeighborhood(mainNeighborhoodId);
      if (neighborhood) {
        return neighborhood.cityId || null;
      }
      if (cachedFilters) {
        const cached = neighborhoodsCacheService.getNeighborhoodByIdFromCache(
          mainNeighborhoodId,
          cachedFilters,
        );
        if (cached) {
          return cached.cityId || null;
        }
      }
    }
    return null;
  }, [mainNeighborhoodId, visible, cachedFilters]);

  const { neighborhoods, loading, error, refetch } = useNeighborhoodsList(visible, mainCityId);

  useEffect(() => {
    setSelectedIds(selectedNeighborhoodIds);
  }, [selectedNeighborhoodIds, visible]);

  useEffect(() => {
    if (selectedIds && neighborhoods.length > 0 && mainNeighborhoodId) {
      const mainNeighborhood = neighborhoods.find(n => n.id === mainNeighborhoodId);
      const mainDepartmentId =
        mainNeighborhood?.departmentId ||
        mainNeighborhood?.city?.departmentId ||
        mainNeighborhood?.city?.department?.id;

      if (mainDepartmentId) {
        setSelectedIds(prev => {
          return prev.filter(selectedId => {
            const neighborhood = neighborhoods.find(n => n.id === selectedId);
            const neighborhoodDepartmentId =
              neighborhood?.departmentId ||
              neighborhood?.city?.departmentId ||
              neighborhood?.city?.department?.id;
            return neighborhoodDepartmentId === mainDepartmentId;
          });
        });
      } else {
        setSelectedIds([]);
      }
    }
  }, [mainNeighborhoodId, neighborhoods]);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const toggleSelection = (id: string) => {
    if (mainNeighborhoodId) {
      const mainNeighborhood = neighborhoods.find(n => n.id === mainNeighborhoodId);
      const mainDepartmentId =
        mainNeighborhood?.departmentId ||
        mainNeighborhood?.city?.departmentId ||
        mainNeighborhood?.city?.department?.id;

      if (mainDepartmentId) {
        const neighborhoodToToggle = neighborhoods.find(n => n.id === id);
        const neighborhoodDepartmentId =
          neighborhoodToToggle?.departmentId ||
          neighborhoodToToggle?.city?.departmentId ||
          neighborhoodToToggle?.city?.department?.id;

        if (neighborhoodDepartmentId !== mainDepartmentId) {
          return;
        }
      }
    }

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods.filter(neighborhood => {
      const matchesSearch = neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isExcluded = excludeNeighborhoodIds.includes(neighborhood.id);
      return matchesSearch && !isExcluded;
    });
  }, [neighborhoods, searchQuery, excludeNeighborhoodIds]);

  return {
    selectedIds,
    searchQuery,
    setSearchQuery,
    neighborhoods: filteredNeighborhoods,
    loading,
    error,
    refetch,
    toggleSelection,
  };
};
