import LocationService from "../../../../../../services/locationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Neighborhood } from "../../../../../../types/user";

const neighborhoodCache = new Map<string, Neighborhood>();
const adjacentCache = new Map<string, Neighborhood[]>();
const pendingRequests = new Map<string, Promise<Neighborhood | null>>();
const pendingAdjacentRequests = new Map<string, Promise<Neighborhood[]>>();

const ALL_NEIGHBORHOODS_CACHE_KEY = "@neighborhoods:all";
const ALL_NEIGHBORHOODS_CACHE_EXPIRY_KEY = "@neighborhoods:all:expiry";
const CACHE_DURATION = 70 * 24 * 60 * 60 * 1000; // 7 días

interface CachedNeighborhoodsData {
  neighborhoods: Neighborhood[];
  cityId?: string;
  timestamp: number;
}

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
   * Carga barrios desde el cache persistente
   */
  async loadFromCache(cityId?: string): Promise<Neighborhood[] | null> {
    try {
      const cacheKey = cityId
        ? `${ALL_NEIGHBORHOODS_CACHE_KEY}:${cityId}`
        : ALL_NEIGHBORHOODS_CACHE_KEY;
      const expiryKey = cityId
        ? `${ALL_NEIGHBORHOODS_CACHE_EXPIRY_KEY}:${cityId}`
        : ALL_NEIGHBORHOODS_CACHE_EXPIRY_KEY;

      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedExpiry = await AsyncStorage.getItem(expiryKey);

      if (cachedData && cachedExpiry) {
        const expiry = parseInt(cachedExpiry, 10);
        if (Date.now() < expiry) {
          const data: CachedNeighborhoodsData = JSON.parse(cachedData);
          // Actualizar cache en memoria también
          data.neighborhoods.forEach(n => {
            if (n.id) {
              neighborhoodCache.set(n.id, n);
            }
          });
          return data.neighborhoods;
        } else {
          // Cache expirado, limpiar
          await AsyncStorage.removeItem(cacheKey);
          await AsyncStorage.removeItem(expiryKey);
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading neighborhoods from cache:", error);
      return null;
    }
  },

  /**
   * Guarda barrios en el cache persistente
   */
  async saveToCache(neighborhoods: Neighborhood[], cityId?: string): Promise<void> {
    try {
      const cacheKey = cityId
        ? `${ALL_NEIGHBORHOODS_CACHE_KEY}:${cityId}`
        : ALL_NEIGHBORHOODS_CACHE_KEY;
      const expiryKey = cityId
        ? `${ALL_NEIGHBORHOODS_CACHE_EXPIRY_KEY}:${cityId}`
        : ALL_NEIGHBORHOODS_CACHE_EXPIRY_KEY;

      const data: CachedNeighborhoodsData = {
        neighborhoods,
        cityId,
        timestamp: Date.now(),
      };

      const expiry = Date.now() + CACHE_DURATION;

      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(expiryKey, expiry.toString());

      // Actualizar cache en memoria también
      neighborhoods.forEach(n => {
        if (n.id) {
          neighborhoodCache.set(n.id, n);
        }
      });
    } catch (error) {
      console.error("Error saving neighborhoods to cache:", error);
    }
  },

  /**
   * Obtiene todos los barrios disponibles (con cache persistente)
   * @param cityId - ID de la ciudad para filtrar (opcional)
   * @param forceRefresh - Si es true, ignora el cache y hace fetch
   */
  async getAllNeighborhoods(cityId?: string, forceRefresh = false): Promise<Neighborhood[]> {
    try {
      // Intentar cargar del cache primero si no es forceRefresh
      if (!forceRefresh) {
        const cached = await this.loadFromCache(cityId);
        if (cached && cached.length > 0) {
          return cached;
        }
      }

      // Si no hay cache o es forceRefresh, hacer fetch
      const neighborhoods = await LocationService.listNeighborhoods(cityId);
      const result = neighborhoods || [];

      // Guardar en cache
      if (result.length > 0) {
        await this.saveToCache(result, cityId);
      }

      return result;
    } catch (error) {
      console.error("Error fetching all neighborhoods:", error);
      // Si hay error, intentar devolver del cache aunque esté expirado
      const cached = await this.loadFromCache(cityId);
      if (cached && cached.length > 0) {
        return cached;
      }
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

  /**
   * Obtiene todos los barrios adyacentes para una lista de barrios (bulk)
   */
  async getAdjacentsForMultiple(ids: string[]): Promise<Neighborhood[]> {
    if (!ids || ids.length === 0) return [];

    // Filtramos IDs únicos para no repetir peticiones
    const uniqueIds = Array.from(new Set(ids.filter(id => !!id)));

    // Obtenemos promesas para todos
    const results = await Promise.all(uniqueIds.map(id => this.getAdjacentNeighborhoods(id)));

    // Aplanamos y deduplicamos resultados
    const flat = results.flat();
    const uniqueMap = new Map<string, Neighborhood>();
    flat.forEach(n => {
      if (n.id) uniqueMap.set(n.id, n);
    });

    return Array.from(uniqueMap.values());
  },
};
