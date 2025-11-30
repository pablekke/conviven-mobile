import type { Neighborhood } from "../../../../../../types/user";

interface CachedLocation {
  neighborhood?: {
    id: string;
    name: string;
  };
  city?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

interface CachedFilters {
  mainPreferredNeighborhood?: {
    id: string;
    name: string;
    cityId?: string;
  };
  mainPreferredLocation?: CachedLocation;
  preferredLocations?: CachedLocation[];
}

/**
 * Servicio para extraer datos de barrios del cache del usuario
 */
export const neighborhoodsCacheService = {
  /**
   * Extrae el barrio principal desde el cache
   */
  getMainNeighborhoodFromCache(filters: CachedFilters | null | undefined): Neighborhood | null {
    if (!filters) {
      return null;
    }

    if (filters.mainPreferredNeighborhood?.id && filters.mainPreferredNeighborhood?.name) {
      return {
        id: filters.mainPreferredNeighborhood.id,
        name: filters.mainPreferredNeighborhood.name,
        cityId: filters.mainPreferredNeighborhood.cityId || "",
      };
    }

    if (
      filters.mainPreferredLocation?.neighborhood?.id &&
      filters.mainPreferredLocation?.neighborhood?.name
    ) {
      return {
        id: filters.mainPreferredLocation.neighborhood.id,
        name: filters.mainPreferredLocation.neighborhood.name,
        cityId: filters.mainPreferredLocation.city?.id || "",
      };
    }

    return null;
  },

  /**
   * Extrae los barrios preferidos desde el cache
   */
  getPreferredNeighborhoodsFromCache(filters: CachedFilters | null | undefined): Neighborhood[] {
    if (!filters?.preferredLocations) {
      return [];
    }

    return filters.preferredLocations
      .map(location => {
        if (!location.neighborhood?.id || !location.neighborhood?.name) {
          return null;
        }
        return {
          id: location.neighborhood.id,
          name: location.neighborhood.name,
          cityId: location.city?.id || "",
        };
      })
      .filter((n): n is Neighborhood => n !== null);
  },

  /**
   * Obtiene un mapa de IDs a nombres de barrios desde el cache
   */
  getNeighborhoodsMapFromCache(
    filters: CachedFilters | null | undefined,
  ): Map<string, Neighborhood> {
    const map = new Map<string, Neighborhood>();

    const main = this.getMainNeighborhoodFromCache(filters);
    if (main) {
      map.set(main.id, main);
    }

    const preferred = this.getPreferredNeighborhoodsFromCache(filters);
    preferred.forEach(neighborhood => {
      map.set(neighborhood.id, neighborhood);
    });

    return map;
  },

  /**
   * Obtiene un barrio por ID desde el cache
   */
  getNeighborhoodByIdFromCache(
    id: string,
    filters: CachedFilters | null | undefined,
  ): Neighborhood | null {
    const map = this.getNeighborhoodsMapFromCache(filters);
    return map.get(id) || null;
  },

  /**
   * Obtiene múltiples barrios por IDs desde el cache
   */
  getNeighborhoodsByIdsFromCache(
    ids: string[],
    filters: CachedFilters | null | undefined,
  ): Neighborhood[] {
    const map = this.getNeighborhoodsMapFromCache(filters);
    return ids
      .map(id => map.get(id))
      .filter((n): n is Neighborhood => n !== null && n !== undefined);
  },
};
