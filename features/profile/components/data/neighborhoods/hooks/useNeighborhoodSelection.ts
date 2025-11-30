import { useState, useEffect } from "react";
import { useNeighborhoodsList } from "./useNeighborhoodsList";
import { neighborhoodsService } from "../services";

interface UseNeighborhoodSelectionProps {
  visible: boolean;
  selectedNeighborhoodIds: string[];
  mainNeighborhoodId?: string | null;
  mode?: "main" | "multiple";
  excludeNeighborhoodIds?: string[];
}

export const useNeighborhoodSelection = ({
  visible,
  selectedNeighborhoodIds,
  mainNeighborhoodId,
  mode = "multiple",
  excludeNeighborhoodIds = [],
}: UseNeighborhoodSelectionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNeighborhoodIds);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(mainNeighborhoodId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainCityId, setMainCityId] = useState<string | null>(null);

  // Obtener el cityId del barrio principal cuando está en modo "multiple"
  useEffect(() => {
    const loadMainNeighborhood = async () => {
      if (mode === "multiple" && mainNeighborhoodId && visible) {
        try {
          const neighborhood = await neighborhoodsService.getNeighborhoodById(mainNeighborhoodId);
          if (neighborhood) {
            const cityId = neighborhood.cityId || neighborhood.city?.id;
            setMainCityId(cityId || null);
          } else {
            setMainCityId(null);
          }
        } catch (error) {
          console.error("Error loading main neighborhood:", error);
          setMainCityId(null);
        }
      } else {
        setMainCityId(null);
      }
    };

    loadMainNeighborhood();
  }, [mode, mainNeighborhoodId, visible]);

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
      const newMainId = selectedMainId === id ? null : id;
      setSelectedMainId(newMainId);

      if (newMainId) {
        const mainNeighborhood = neighborhoods.find(n => n.id === newMainId);
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
