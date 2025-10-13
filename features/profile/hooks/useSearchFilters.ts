import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import searchFiltersService from "../services/searchFiltersService";
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
  saveFormData: () => Promise<void>;
  resetFormData: () => void;
}

const DEFAULT_FILTERS: SearchFiltersFormData = {
  genderPref: [],
  minAge: 18,
  maxAge: 50,
  budgetMin: 10000,
  budgetMax: 50000,
  onlyWithPhoto: true,
};

export const useSearchFilters = (): UseSearchFiltersReturn => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [originalData, setOriginalData] = useState<SearchFiltersFormData>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const mapApiToFormData = useCallback((apiData: SearchFilters): SearchFiltersFormData => {
    return {
      genderPref: apiData.genderPref ?? [],
      minAge: apiData.minAge ?? 18,
      maxAge: apiData.maxAge ?? 50,
      budgetMin: apiData.budgetMin ? parseFloat(apiData.budgetMin) : 10000,
      budgetMax: apiData.budgetMax ? parseFloat(apiData.budgetMax) : 50000,
      onlyWithPhoto: apiData.onlyWithPhoto ?? true,
    };
  }, []);

  useEffect(() => {
    const loadFilters = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const data = await searchFiltersService.getSearchFilters();
        const formattedData = mapApiToFormData(data);
        setFormData(formattedData);
        setOriginalData(formattedData);
      } catch (error) {
        console.error("Error loading search filters:", error);
        setFormData(DEFAULT_FILTERS);
        setOriginalData(DEFAULT_FILTERS);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, [user, mapApiToFormData]);

  const updateFormData = useCallback(
    (field: keyof SearchFiltersFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
        return newData;
      });
    },
    [originalData],
  );

  const saveFormData = useCallback(async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setSaving(true);
    try {
      const payload: UpdateSearchFiltersRequest = {
        genderPref: formData.genderPref.length > 0 ? formData.genderPref : undefined,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        onlyWithPhoto: formData.onlyWithPhoto,
      };

      const updated = await searchFiltersService.upsertSearchFilters(payload);
      const formattedData = mapApiToFormData(updated);
      setFormData(formattedData);
      setOriginalData(formattedData);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving search filters:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, formData, mapApiToFormData]);

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
