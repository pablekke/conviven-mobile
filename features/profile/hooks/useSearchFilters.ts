import searchFiltersService, { SearchFiltersFormData } from "../services/searchFiltersService";
import { useDataPreload } from "../../../context/DataPreloadContext";
import { useState, useEffect, useCallback, useRef } from "react";
import searchFiltersAdapter from "../adapters/searchFiltersAdapter";

export interface UseSearchFiltersReturn {
  formData: SearchFiltersFormData;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  updateFormData: (
    fieldOrObject: keyof SearchFiltersFormData | Partial<SearchFiltersFormData>,
    value?: any,
  ) => void;
  saveFormData: (overrideValues?: Partial<SearchFiltersFormData>) => Promise<void>;
  resetFormData: () => void;
  reloadFromContext: () => void;
}

const DEFAULT_FILTERS: SearchFiltersFormData = {
  mainPreferredNeighborhoodId: "",
  preferredLocations: [],
  includeAdjacentNeighborhoods: false,
  genderPref: [],
  genders: [],
  minAge: 18,
  maxAge: 100,
  budgetMin: 0,
  budgetMax: 100000,
  onlyWithPhoto: true,
};

export const useSearchFilters = (): UseSearchFiltersReturn => {
  const { searchFilters, searchFiltersLoading, updateSearchFiltersState } = useDataPreload();

  const [formData, setFormData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [originalData, setOriginalData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (searchFilters && !initialized.current) {
      const formatted = searchFiltersAdapter.mapApiToFormData(searchFilters);
      setFormData(formatted);
      setOriginalData(formatted);
      setLoading(false);
      initialized.current = true;
    }
  }, [searchFilters]);

  const updateFormData = useCallback(
    (fieldOrObject: keyof SearchFiltersFormData | Partial<SearchFiltersFormData>, value?: any) => {
      setFormData(prev => {
        const updates =
          typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;

        const newData = { ...prev, ...updates };

        const changed = JSON.stringify(newData) !== JSON.stringify(originalData);
        setHasChanges(changed);
        return newData;
      });
    },
    [originalData],
  );

  const saveFormData = useCallback(
    async (overrides?: Partial<SearchFiltersFormData>) => {
      setSaving(true);
      try {
        const dataToSave = { ...formData, ...overrides };
        const payload = await searchFiltersAdapter.mapFormDataToApi(dataToSave);
        const updated = await searchFiltersService.upsertSearchFilters(payload);
        const formatted = searchFiltersAdapter.mapApiToFormData(updated);
        setFormData(formatted);
        setOriginalData(formatted);
        setHasChanges(false);
        updateSearchFiltersState(updated);
      } catch (e) {
        console.error("[useSearchFilters] Save error:", e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [formData, updateSearchFiltersState],
  );

  const resetFormData = useCallback(() => setFormData(originalData), [originalData]);

  return {
    formData,
    loading: loading || searchFiltersLoading,
    saving,
    hasChanges,
    updateFormData,
    saveFormData,
    resetFormData,
    reloadFromContext: () => {},
  };
};
