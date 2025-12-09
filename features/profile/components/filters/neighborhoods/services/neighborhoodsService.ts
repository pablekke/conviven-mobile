import LocationService from "../../../../../../services/locationService";
import type { Neighborhood } from "../../../../../../types/user";

const neighborhoodCache = new Map<string, Neighborhood>();
const adjacentCache = new Map<string, Neighborhood[]>();
const pendingRequests = new Map<string, Promise<Neighborhood | null>>();
const pendingAdjacentRequests = new Map<string, Promise<Neighborhood[]>>();

export const getCachedNeighborhood = (id: string): Neighborhood | null => {
  return neighborhoodCache.get(id) || null;
};

export const getCachedNeighborhoods = (ids: string[]): Neighborhood[] => {
  const result: Neighborhood[] = [];
  for (const id of ids) {
    const cached = neighborhoodCache.get(id);
    if (cached) {
      result.push(cached);
    }
  }
  return result;
};

/**
 * Servicio para operaciones relacionadas con barrios
 */
export const neighborhoodsService = {
  /**
   * Obtiene todos los barrios disponibles
   * @param cityId - ID de la ciudad para filtrar (opcional)
   */
  async getAllNeighborhoods(cityId?: string): Promise<Neighborhood[]> {
    try {
      const neighborhoods = await LocationService.listNeighborhoods(cityId);
      return neighborhoods || [];
    } catch (error) {
      console.error("Error fetching all neighborhoods:", error);
      throw error;
    }
  },

  /**
   * Obtiene un barrio por su ID con cache y deduplicación
   */
  async getNeighborhoodById(id: string): Promise<Neighborhood | null> {
    if (!id) return null;

    if (neighborhoodCache.has(id)) {
      return neighborhoodCache.get(id) || null;
    }

    if (pendingRequests.has(id)) {
      return pendingRequests.get(id)!;
    }

    const request = (async () => {
      try {
        const neighborhood = await LocationService.getNeighborhood(id);
        if (neighborhood) {
          neighborhoodCache.set(id, neighborhood);
        }
        return neighborhood;
      } catch (error) {
        return null;
      } finally {
        pendingRequests.delete(id);
      }
    })();

    pendingRequests.set(id, request);
    return request;
  },

  /**
   * Obtiene múltiples barrios por sus IDs con deduplicación
   */
  async getNeighborhoodsByIds(ids: string[]): Promise<Neighborhood[]> {
    if (ids.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(ids));
    const cached: Neighborhood[] = [];
    const missingIds: string[] = [];

    for (const id of uniqueIds) {
      if (neighborhoodCache.has(id)) {
        const cachedNeighborhood = neighborhoodCache.get(id);
        if (cachedNeighborhood) {
          cached.push(cachedNeighborhood);
        }
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      return cached;
    }

    try {
      const neighborhoodPromises = missingIds.map(id => this.getNeighborhoodById(id));
      const neighborhoods = await Promise.all(neighborhoodPromises);
      const loaded = neighborhoods.filter((n): n is Neighborhood => n !== null);
      return [...cached, ...loaded];
    } catch (error) {
      console.error("Error loading neighborhoods by IDs:", error);
      return cached;
    }
  },

  /**
   * Obtiene los barrios adyacentes a un barrio con deduplicación
   */
  async getAdjacentNeighborhoods(neighborhoodId: string): Promise<Neighborhood[]> {
    if (!neighborhoodId) return [];

    const cacheKey = `adjacents_${neighborhoodId}`;
    if (adjacentCache.has(cacheKey)) {
      return adjacentCache.get(cacheKey)!;
    }

    if (pendingAdjacentRequests.has(cacheKey)) {
      return pendingAdjacentRequests.get(cacheKey)!;
    }

    const request = (async () => {
      try {
        const adjacents = await LocationService.getAdjacentNeighborhoods(neighborhoodId);
        const result = adjacents || [];
        adjacentCache.set(cacheKey, result);
        for (const adj of result) {
          if (adj.id) {
            neighborhoodCache.set(adj.id, adj);
          }
        }
        return result;
      } catch (error) {
        console.error("Error loading adjacent neighborhoods:", error);
        return [];
      } finally {
        pendingAdjacentRequests.delete(cacheKey);
      }
    })();

    pendingAdjacentRequests.set(cacheKey, request);
    return request;
  },
};
