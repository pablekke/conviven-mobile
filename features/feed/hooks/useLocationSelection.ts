import { useState, useEffect } from "react";

export interface UseLocationSelectionProps {
  locationStrings: string[];
  resetDependencies?: unknown[];
}

export interface UseLocationSelectionReturn {
  locationOpen: boolean;
  activeLocationIndex: number;
  mainLocation: string;
  setLocationOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setActiveLocationIndex: (index: number) => void;
  toggleLocation: () => void;
  handleLocationSelect: (location: string, index: number) => void;
}

export function useLocationSelection({
  locationStrings,
  resetDependencies = [],
}: UseLocationSelectionProps): UseLocationSelectionReturn {
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);

  useEffect(() => {
    setLocationOpen(false);
    setActiveLocationIndex(0);
  }, [locationStrings, ...resetDependencies]);

  const mainLocation = locationStrings[activeLocationIndex] ?? locationStrings[0] ?? "—";

  const toggleLocation = () => {
    setLocationOpen(v => !v);
  };

  const handleLocationSelect = (_location: string, index: number) => {
    setActiveLocationIndex(index);
    setLocationOpen(false);
  };

  return {
    locationOpen,
    activeLocationIndex,
    mainLocation,
    setLocationOpen,
    setActiveLocationIndex,
    toggleLocation,
    handleLocationSelect,
  };
}
