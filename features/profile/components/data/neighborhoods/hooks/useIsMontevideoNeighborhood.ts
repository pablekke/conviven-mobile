import { useMemo } from "react";
import { useNeighborhood } from "./useNeighborhood";

interface UseIsMontevideoNeighborhoodProps {
  neighborhoodId: string | null;
  cachedFilters?: any | null;
}

/**
 * Hook para verificar si un barrio pertenece a la ciudad de Montevideo
 */
export const useIsMontevideoNeighborhood = ({
  neighborhoodId,
  cachedFilters,
}: UseIsMontevideoNeighborhoodProps): boolean => {
  const { neighborhood } = useNeighborhood({ neighborhoodId, cachedFilters });

  const isMontevideo = useMemo(() => {
    if (!neighborhood) return false;

    const cityNameFlat = neighborhood.cityName?.toLowerCase()?.trim();
    const cityNameNested = neighborhood.city?.name?.toLowerCase()?.trim();
    const departmentName = neighborhood.city?.department?.name?.toLowerCase()?.trim();

    const cityName = cityNameFlat || cityNameNested;
    const result = cityName === "montevideo" || departmentName === "montevideo";

    return result;
  }, [neighborhood]);

  return isMontevideo;
};
