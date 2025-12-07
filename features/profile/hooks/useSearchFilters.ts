import { neighborhoodsService } from "../components/data/neighborhoods/services";
import type { SearchFiltersFormData } from "../services/searchFiltersService";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { searchFiltersService } from "../services";
import { searchFiltersAdapter } from "../adapters";

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
  preferredLocations: [],
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
        lastMainNeighborhoodIdRef.current = formattedData.mainPreferredNeighborhoodId || "";
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
      lastMainNeighborhoodIdRef.current = formattedData.mainPreferredNeighborhoodId || "";
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
        // Comparar de forma más robusta, especialmente para arrays
        const changed = JSON.stringify(newData) !== JSON.stringify(originalData);
        setHasChanges(changed);
        return newData;
      });
    },
    [originalData],
  );

  // Efecto para recalcular hasChanges cuando cambia formData o originalData
  useEffect(() => {
    if (!initialized.current) return;
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const lastMainNeighborhoodIdRef = useRef<string>("");

  useEffect(() => {
    if (!initialized.current) return;

    const currentMainId = formData.mainPreferredNeighborhoodId || "";
    if (currentMainId === lastMainNeighborhoodIdRef.current) {
      return;
    }
    lastMainNeighborhoodIdRef.current = currentMainId;

    const filterNeighborhoodsByDepartment = async () => {
      if (!formData.mainPreferredNeighborhoodId) {
        return;
      }
      if (formData.preferredLocations.length === 0) {
        return;
      }

      try {
        const mainDepartmentId = searchFilters?.mainPreferredLocation?.department?.id;

        if (!mainDepartmentId) {
          const mainNeighborhood = await neighborhoodsService.getNeighborhoodById(
            formData.mainPreferredNeighborhoodId,
          );
          const fallbackDepartmentId =
            mainNeighborhood?.departmentId ||
            mainNeighborhood?.city?.departmentId ||
            mainNeighborhood?.city?.department?.id;

          if (!fallbackDepartmentId) {
            updateFormData("preferredLocations", []);
            return;
          }

          // Usar el fallback para filtrar
          const neighborhoods = await neighborhoodsService.getNeighborhoodsByIds(
            formData.preferredLocations,
          );

          const filteredIds = neighborhoods
            .filter(neighborhood => {
              const neighborhoodDepartmentId =
                neighborhood?.departmentId ||
                neighborhood?.city?.departmentId ||
                neighborhood?.city?.department?.id;
              return neighborhoodDepartmentId === fallbackDepartmentId;
            })
            .map(neighborhood => neighborhood.id);

          if (filteredIds.length !== formData.preferredLocations.length) {
            updateFormData("preferredLocations", filteredIds);
          }
          return;
        }

        const neighborhoods = await neighborhoodsService.getNeighborhoodsByIds(
          formData.preferredLocations,
        );

        const filteredIds = neighborhoods
          .filter(neighborhood => {
            const neighborhoodDepartmentId =
              neighborhood?.departmentId ||
              neighborhood?.city?.departmentId ||
              neighborhood?.city?.department?.id;
            return neighborhoodDepartmentId === mainDepartmentId;
          })
          .map(neighborhood => neighborhood.id);

        if (filteredIds.length !== formData.preferredLocations.length) {
          updateFormData("preferredLocations", filteredIds);
        }
      } catch (error) {
        console.error("Error filtering neighborhoods by department:", error);
      }
    };

    filterNeighborhoodsByDepartment();
  }, [formData.mainPreferredNeighborhoodId, searchFilters, updateFormData]);

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

        // El adapter se encarga de toda la conversión
        const payload = await searchFiltersAdapter.mapFormDataToApi(dataToSave);

        const updatedFilters = await searchFiltersService.upsertSearchFilters(payload);

        // Update local state closely to what we expect
        const formattedData = searchFiltersAdapter.mapApiToFormData(updatedFilters);
        setFormData(formattedData);
        setOriginalData(formattedData);
        lastMainNeighborhoodIdRef.current = formattedData.mainPreferredNeighborhoodId || "";
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
