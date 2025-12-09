import { useNeighborhoodsList } from "./useNeighborhoodsList";
import { getCachedNeighborhood, neighborhoodsCacheService } from "../services";
import { useEffect, useState, useMemo } from "react";

interface UseNeighborhoodSelectionProps {
  visible: boolean;
  selectedNeighborhoodIds: string[];
  mainNeighborhoodId?: string | null;
  mode?: "main" | "multiple";
  excludeNeighborhoodIds?: string[];
  cachedFilters?: any | null;
}

export const useNeighborhoodSelection = ({
  visible,
  selectedNeighborhoodIds,
  mainNeighborhoodId,
  mode = "multiple",
  excludeNeighborhoodIds = [],
  cachedFilters,
}: UseNeighborhoodSelectionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNeighborhoodIds);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(mainNeighborhoodId || null);
  const [searchQuery, setSearchQuery] = useState("");

  const mainCityId = useMemo(() => {
    if (mode === "multiple" && mainNeighborhoodId && visible) {
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
  }, [mode, mainNeighborhoodId, visible, cachedFilters]);

  const { neighborhoods, loading, error, refetch } = useNeighborhoodsList(
    visible,
    mode === "multiple" && mainNeighborhoodId ? mainCityId : null,
  );

  useEffect(() => {
    setSelectedIds(selectedNeighborhoodIds);
    setSelectedMainId(mainNeighborhoodId || null);
  }, [selectedNeighborhoodIds, mainNeighborhoodId, visible]);

  useEffect(() => {
    if (selectedMainId && neighborhoods.length > 0) {
      const mainNeighborhood = neighborhoods.find(n => n.id === selectedMainId);
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
  }, [selectedMainId, neighborhoods]);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const toggleSelection = (id: string) => {
    if (mode === "main") {
      if (selectedMainId === id) {
        return;
      }

      setSelectedMainId(id);

      const mainNeighborhood = neighborhoods.find(n => n.id === id);
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
    } else {
      if (selectedMainId) {
        const mainNeighborhood = neighborhoods.find(n => n.id === selectedMainId);
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
    }
  };

  const filteredNeighborhoods = neighborhoods.filter(neighborhood => {
    const matchesSearch = neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isExcluded = excludeNeighborhoodIds.includes(neighborhood.id);
    return matchesSearch && !isExcluded;
  });

  return {
    selectedIds,
    selectedMainId,
    searchQuery,
    setSearchQuery,
    neighborhoods: filteredNeighborhoods,
    loading,
    error,
    refetch,
    toggleSelection,
  };
};
