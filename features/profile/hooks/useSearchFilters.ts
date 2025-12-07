import { neighborhoodsService } from "../components/data/neighborhoods/services";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { searchFiltersService } from "../services";
import { searchFiltersAdapter } from "../adapters";
import type {
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
  reloadFromContext: () => void;
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
  const { searchFilters, searchFiltersLoading, updateSearchFiltersState } = useDataPreload();

  const [formData, setFormData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [originalData, setOriginalData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const lastSearchFiltersRef = useRef<any>(null);
  const componentMountedRef = useRef(true);

  const loadDataFromContext = useCallback(() => {
    if (!componentMountedRef.current) return;

    if (searchFilters) {
      const formattedData = searchFiltersAdapter.mapApiToFormData(searchFilters);

      const searchFiltersChanged =
        JSON.stringify(searchFilters) !== JSON.stringify(lastSearchFiltersRef.current);
      if (!initialized.current || (!hasChanges && searchFiltersChanged)) {
        setFormData(formattedData);
        setOriginalData(formattedData);
        setHasChanges(false);
        setLoading(false);
        initialized.current = true;
        lastSearchFiltersRef.current = searchFilters;
      }
    } else if (!searchFiltersLoading && !searchFilters) {
      if (!initialized.current) {
        setLoading(false);
        initialized.current = true;
      }
    }
  }, [searchFilters, searchFiltersLoading, hasChanges]);

  useEffect(() => {
    loadDataFromContext();
  }, [loadDataFromContext]);

  const reloadFromContext = useCallback(() => {
    if (!hasChanges && searchFilters) {
      const formattedData = searchFiltersAdapter.mapApiToFormData(searchFilters);
      setFormData(formattedData);
      setOriginalData(formattedData);
      lastSearchFiltersRef.current = searchFilters;
      setHasChanges(false);
      initialized.current = true;
    }
  }, [hasChanges, searchFilters]);

  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      initialized.current = false;
      setFormData(DEFAULT_FILTERS);
      setLoading(false);
    }
  }, [user]);

  const updateFormData = useCallback(
    (field: keyof SearchFiltersFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        const changed = JSON.stringify(newData) !== JSON.stringify(originalData);
        setHasChanges(changed);
        return newData;
      });
    },
    [originalData],
  );

  useEffect(() => {
    if (!initialized.current) return;

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
  }, [formData.mainPreferredNeighborhoodId]);

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

        const updatedFilters = await searchFiltersService.upsertSearchFilters(payload);

        // Update local state closely to what we expect
        const formattedData = searchFiltersAdapter.mapApiToFormData(updatedFilters);
        setFormData(formattedData);
        setOriginalData(formattedData);
        setHasChanges(false);

        // Update Global Context
        updateSearchFiltersState(updatedFilters);
      } catch (error) {
        console.error("Error saving search filters:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [user, formData, updateSearchFiltersState],
  );

  const resetFormData = useCallback(() => {
    setFormData(originalData);
    setHasChanges(false);
  }, [originalData]);

  return {
    formData,
    loading: loading || (searchFiltersLoading && !initialized.current),
    saving,
    hasChanges,
    updateFormData,
    saveFormData,
    resetFormData,
    reloadFromContext,
  };
};
