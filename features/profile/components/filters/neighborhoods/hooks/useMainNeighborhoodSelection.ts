import { useNeighborhoodsList } from "./useNeighborhoodsList";
import { useEffect, useState, useMemo } from "react";

interface UseMainNeighborhoodSelectionProps {
  visible: boolean;
  mainNeighborhoodId?: string | null;
  cityId?: string;
}

export const useMainNeighborhoodSelection = ({
  visible,
  mainNeighborhoodId,
  cityId,
}: UseMainNeighborhoodSelectionProps) => {
  const [selectedMainId, setSelectedMainId] = useState<string | null>(mainNeighborhoodId || null);
  const [searchQuery, setSearchQuery] = useState("");

  const { neighborhoods, loading, error, refetch } = useNeighborhoodsList(visible, cityId);

  useEffect(() => {
    setSelectedMainId(mainNeighborhoodId || null);
  }, [mainNeighborhoodId, visible]);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const toggleSelection = (id: string) => {
    if (selectedMainId === id) {
      return;
    }
    setSelectedMainId(id);
  };

  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods.filter(neighborhood =>
      neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [neighborhoods, searchQuery]);

  return {
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
