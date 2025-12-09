import { useMemo } from "react";

interface UseIsMontevideoNeighborhoodProps {
  neighborhoodId: string | null;
  cachedFilters?: any | null;
}

export const useIsMontevideoNeighborhood = ({
  neighborhoodId,
  cachedFilters,
}: UseIsMontevideoNeighborhoodProps): boolean => {
  const isMontevideo = useMemo(() => {
    if (!neighborhoodId || !cachedFilters) return false;

    const mainLocation = cachedFilters.mainPreferredLocation;
    if (mainLocation?.neighborhood?.id === neighborhoodId) {
      const cityName = mainLocation.city?.name?.toLowerCase()?.trim();
      const departmentName = mainLocation.department?.name?.toLowerCase()?.trim();
      return cityName === "montevideo" || departmentName === "montevideo";
    }

    if (cachedFilters.preferredLocations) {
      const location = cachedFilters.preferredLocations.find(
        (loc: any) => loc.neighborhood?.id === neighborhoodId,
      );
      if (location) {
        const cityName = location.city?.name?.toLowerCase()?.trim();
        const departmentName = location.department?.name?.toLowerCase()?.trim();
        return cityName === "montevideo" || departmentName === "montevideo";
      }
    }

    return false;
  }, [neighborhoodId, cachedFilters]);

  return isMontevideo;
};
