import {
  getCachedValue,
  setCachedValue,
  clearCachedValue,
} from "../../../services/resilience/cache";
import { searchFiltersService } from "../services";
import { searchFiltersAdapter } from "../adapters";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { neighborhoodsService } from "../components/data/neighborhoods/services";
import type {
  SearchFilters,
  SearchFiltersFormData,
  UpdateSearchFiltersRequest,
} from "../services/searchFiltersService";

export interface UseSearchFiltersReturn {
  formData: SearchFiltersFormData;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  updateFormData: (field: keyof SearchFiltersFormData, value: any) => void;
  saveFormData: (overrideValues?: Partial<SearchFiltersFormData>) => Promise<void>;
  resetFormData: () => void;
}

const DEFAULT_FILTERS: SearchFiltersFormData = {
  // Filtros de Ubicación
  mainPreferredNeighborhoodId: "",
  preferredNeighborhoods: [],
  includeAdjacentNeighborhoods: false,
  // Filtros Demográficos
  genderPref: [],
  genders: [],
  minAge: 18,
  maxAge: 100,
  // Filtros Económicos
  budgetMin: 0,
  budgetMax: 100000,
  // Filtros de Calidad
  onlyWithPhoto: true,
};

export const useSearchFilters = (): UseSearchFiltersReturn => {
  const { user } = useAuth();
  const { refreshProfile } = useDataPreload();
  const [formData, setFormData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [originalData, setOriginalData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  // Inicializar loading en false para evitar spinners si hay datos en cache
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadFilters = async (forceRefresh: boolean = false) => {
      if (!user) {
        setInitialized(true);
        return;
      }

      try {
        // Primero intentar usar cache de API (ya precargado)
        if (!forceRefresh) {
          const cachedData = await getCachedValue<SearchFilters>("/search-filters/me");
          if (cachedData) {
            const formattedData = searchFiltersAdapter.mapApiToFormData(cachedData);
            setFormData(formattedData);
            setOriginalData(formattedData);
            setLoading(false);
            setInitialized(true);
            // Hacer refresh en background para mantener datos actualizados
            searchFiltersService
              .getSearchFilters()
              .then(data => {
                const updatedFormattedData = searchFiltersAdapter.mapApiToFormData(data);
                setFormData(updatedFormattedData);
                setOriginalData(updatedFormattedData);
              })
              .catch(error => {
                console.error("Error refreshing search filters in background:", error);
              });
            return;
          }
        }

        // Solo mostrar loading si no hay cache disponible
        setLoading(true);
        const data = await searchFiltersService.getSearchFilters();
        const formattedData = searchFiltersAdapter.mapApiToFormData(data);
        setFormData(formattedData);
        setOriginalData(formattedData);
        setInitialized(true);
      } catch (error) {
        console.error("Error loading search filters:", error);
        setFormData(DEFAULT_FILTERS);
        setOriginalData(DEFAULT_FILTERS);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      loadFilters(false);
    }
  }, [user, initialized]);

  const updateFormData = useCallback(
    (field: keyof SearchFiltersFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        const changed = JSON.stringify(newData) !== JSON.stringify(originalData);
        setHasChanges(changed);

        if (
          changed ||
          field === "preferredNeighborhoods" ||
          field === "mainPreferredNeighborhoodId"
        ) {
          setCachedValue("@searchFilters/draft", newData).catch(() => {});
        }

        return newData;
      });
    },
    [originalData],
  );

  useEffect(() => {
    if (!initialized) return;

    const filterNeighborhoodsByDepartment = async () => {
      if (!formData.mainPreferredNeighborhoodId) {
        return;
      }

      if (formData.preferredNeighborhoods.length === 0) {
        return;
      }

      try {
        const mainNeighborhood = await neighborhoodsService.getNeighborhoodById(
          formData.mainPreferredNeighborhoodId,
        );
        const mainDepartmentId =
          mainNeighborhood?.city?.departmentId || mainNeighborhood?.city?.department?.id;

        if (!mainDepartmentId) {
          setFormData(prev => ({ ...prev, preferredNeighborhoods: [] }));
          return;
        }

        const neighborhoods = await neighborhoodsService.getNeighborhoodsByIds(
          formData.preferredNeighborhoods,
        );

        const filteredIds = neighborhoods
          .filter(neighborhood => {
            const neighborhoodDepartmentId =
              neighborhood?.city?.departmentId || neighborhood?.city?.department?.id;
            return neighborhoodDepartmentId === mainDepartmentId;
          })
          .map(neighborhood => neighborhood.id);

        if (filteredIds.length !== formData.preferredNeighborhoods.length) {
          setFormData(prev => ({
            ...prev,
            preferredNeighborhoods: filteredIds,
          }));
        }
      } catch (error) {
        console.error("Error filtering neighborhoods by department:", error);
      }
    };

    filterNeighborhoodsByDepartment();
  }, [formData.mainPreferredNeighborhoodId, initialized]);

  const saveFormData = useCallback(
    async (overrideValues?: Partial<SearchFiltersFormData>) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      setSaving(true);
      try {
        const filteredOverrides = overrideValues
          ? Object.fromEntries(
              Object.entries(overrideValues).filter(([_, value]) => value !== undefined),
            )
          : {};
        const dataToSave = { ...formData, ...filteredOverrides };

        const payload: UpdateSearchFiltersRequest = {
          // Filtros de Ubicación
          mainPreferredNeighborhoodId: dataToSave.mainPreferredNeighborhoodId || undefined,
          preferredNeighborhoods:
            dataToSave.preferredNeighborhoods.length > 0
              ? dataToSave.preferredNeighborhoods
              : undefined,
          includeAdjacentNeighborhoods: dataToSave.includeAdjacentNeighborhoods,
          // Filtros Demográficos
          genderPref: dataToSave.genderPref.length > 0 ? dataToSave.genderPref : undefined,
          genders: dataToSave.genders.length > 0 ? dataToSave.genders : undefined,
          minAge: dataToSave.minAge,
          maxAge: dataToSave.maxAge,
          // Filtros Económicos
          budgetMin: dataToSave.budgetMin,
          budgetMax: dataToSave.budgetMax,
          // Filtros de Calidad
          onlyWithPhoto: dataToSave.onlyWithPhoto,
        };

        await searchFiltersService.upsertSearchFilters(payload);
        const reloadedData = await searchFiltersService.getSearchFilters();
        const formattedData = searchFiltersAdapter.mapApiToFormData(reloadedData);
        setFormData(formattedData);
        setOriginalData(formattedData);
        setHasChanges(false);

        await clearCachedValue("@searchFilters/draft");
        await refreshProfile();
      } catch (error) {
        console.error("Error saving search filters:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [user, formData],
  );

  const resetFormData = useCallback(() => {
    setFormData(originalData);
    setHasChanges(false);
  }, [originalData]);

  return {
    formData,
    loading,
    saving,
    hasChanges,
    updateFormData,
    saveFormData,
    resetFormData,
  };
};
