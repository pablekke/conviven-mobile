import LocationService from "../../../../../../services/locationService";
import type { Neighborhood } from "../../../../../../types/user";

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
   * Obtiene un barrio por su ID
   */
  async getNeighborhoodById(id: string): Promise<Neighborhood | null> {
    try {
      const neighborhood = await LocationService.getNeighborhood(id);
      return neighborhood;
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtiene múltiples barrios por sus IDs
   */
  async getNeighborhoodsByIds(ids: string[]): Promise<Neighborhood[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      const neighborhoodPromises = ids.map(id => this.getNeighborhoodById(id));
      const neighborhoods = await Promise.all(neighborhoodPromises);
      return neighborhoods.filter((n): n is Neighborhood => n !== null);
    } catch (error) {
      console.error("Error loading neighborhoods by IDs:", error);
      return [];
    }
  },

  /**
   * Obtiene los barrios adyacentes a un barrio
   */
  async getAdjacentNeighborhoods(neighborhoodId: string): Promise<Neighborhood[]> {
    try {
      const adjacents = await LocationService.getAdjacentNeighborhoods(neighborhoodId);
      return adjacents || [];
    } catch (error) {
      console.error("Error loading adjacent neighborhoods:", error);
      return [];
    }
  },
};
