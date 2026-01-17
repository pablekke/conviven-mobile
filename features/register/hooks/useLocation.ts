import { useCallback, useEffect, useState } from "react";
import LocationService from "../../../services/locationService";
import { Department, City, Neighborhood, LocationLoading } from "../types";

export interface UseLocationReturn {
  departments: Department[];
  cities: City[];
  neighborhoods: Neighborhood[];
  loading: LocationLoading;
  loadCities: (departmentId: string) => Promise<void>;
  loadNeighborhoods: (cityId: string) => Promise<void>;
  clearCities: () => void;
  clearNeighborhoods: () => void;
}

/**
 * Hook para manejar la carga de datos de ubicación
 */
export const useLocation = (): UseLocationReturn => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState<LocationLoading>({
    departments: false,
    cities: false,
    neighborhoods: false,
  });

  const loadDepartments = useCallback(async () => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const data = await LocationService.listDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  }, []);

  const loadCities = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setCities([]);
      return;
    }

    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const data = await LocationService.listCities(departmentId);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  }, []);

  const loadNeighborhoods = useCallback(async (cityId: string) => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }

    setLoading(prev => ({ ...prev, neighborhoods: true }));
    try {
      const data = await LocationService.listNeighborhoods(cityId);
      setNeighborhoods(data);
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
      setNeighborhoods([]);
    } finally {
      setLoading(prev => ({ ...prev, neighborhoods: false }));
    }
  }, []);

  const clearCities = useCallback(() => {
    setCities([]);
    setNeighborhoods([]);
  }, []);

  const clearNeighborhoods = useCallback(() => {
    setNeighborhoods([]);
  }, []);

  useEffect(() => {
    loadDepartments().catch(() => {});
  }, [loadDepartments]);

  return {
    departments,
    cities,
    neighborhoods,
    loading,
    loadCities,
    loadNeighborhoods,
    clearCities,
    clearNeighborhoods,
  };
};
