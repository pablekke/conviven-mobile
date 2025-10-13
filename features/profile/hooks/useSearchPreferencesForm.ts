import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  SearchPreferencesFormData,
  createDefaultSearchPreferences,
  SearchPreferences,
} from "../interfaces";
import { searchPreferencesService } from "../services";

export interface UseSearchPreferencesFormReturn {
  formData: SearchPreferencesFormData;
  loading: boolean;
  saving: boolean;
  updateFormData: (field: keyof SearchPreferencesFormData, value: any) => void;
  resetFormData: () => void;
  saveFormData: () => Promise<void>;
  hasChanges: boolean;
}

export const useSearchPreferencesForm = (): UseSearchPreferencesFormReturn => {
  const { user } = useAuth();
  const defaultPrefs = createDefaultSearchPreferences();
  const [formData, setFormData] = useState<SearchPreferencesFormData>(defaultPrefs);
  const [initialData, setInitialData] = useState<SearchPreferencesFormData>(defaultPrefs);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mapear datos de la API a formato de formulario
  const mapApiToFormData = useCallback((apiData: SearchPreferences): SearchPreferencesFormData => {
    return {
      // Filtros de Ubicación
      mainPreferredNeighborhoodId: apiData.mainPreferredNeighborhoodId ?? "",
      preferredNeighborhoods: apiData.preferredNeighborhoods ?? [],
      includeAdjacentNeighborhoods: apiData.includeAdjacentNeighborhoods ?? false,

      // Filtros Demográficos
      genderPref: apiData.genderPref ?? [],
      minAge: apiData.minAge ?? 18,
      maxAge: apiData.maxAge ?? 50,

      // Filtros Económicos
      budgetMin: apiData.budgetMin ?? 10000,
      budgetMax: apiData.budgetMax ?? 50000,

      // Filtros de Calidad
      onlyWithPhoto: apiData.onlyWithPhoto ?? true,
      lastActiveWithinDays: apiData.lastActiveWithinDays ?? 30,

      // Dealbreakers
      noCigarettes: apiData.noCigarettes ?? false,
      noWeed: apiData.noWeed ?? false,
      noPets: apiData.noPets ?? false,
      petsRequired: apiData.petsRequired ?? false,
      requireQuietHoursOverlap: apiData.requireQuietHoursOverlap ?? false,

      // Preferencias de compatibilidad
      tidinessMin: apiData.tidinessMin ?? "",
      schedulePref: apiData.schedulePref ?? "",
      guestsMax: apiData.guestsMax ?? "",
      musicMax: apiData.musicMax ?? "",

      // Arrays
      languagesPref: apiData.languagesPref ?? [],
      interestsPref: apiData.interestsPref ?? [],
      zodiacPref: apiData.zodiacPref ?? [],
    };
  }, []);

  // Cargar datos iniciales desde la API
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiData = await searchPreferencesService.getSearchPreferences();

        const formattedData = mapApiToFormData(apiData);
        setFormData(formattedData);
        setInitialData(formattedData);
      } catch (error) {
        const defaultData = createDefaultSearchPreferences();
        setFormData(defaultData);
        setInitialData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, mapApiToFormData]);

  const updateFormData = useCallback(
    (field: keyof SearchPreferencesFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        const changed = JSON.stringify(newData) !== JSON.stringify(initialData);
        setHasChanges(changed);

        return newData;
      });
    },
    [initialData],
  );

  const resetFormData = useCallback(() => {
    setFormData(initialData);
    setHasChanges(false);
  }, [initialData]);

  const saveFormData = useCallback(async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setSaving(true);
    try {
      const dataToSave = {
        // Filtros de Ubicación
        mainPreferredNeighborhoodId: formData.mainPreferredNeighborhoodId || undefined,
        preferredNeighborhoods:
          formData.preferredNeighborhoods.length > 0 ? formData.preferredNeighborhoods : undefined,
        includeAdjacentNeighborhoods: formData.includeAdjacentNeighborhoods,

        // Filtros Demográficos
        genderPref: formData.genderPref.length > 0 ? formData.genderPref : undefined,
        minAge: formData.minAge ?? undefined,
        maxAge: formData.maxAge ?? undefined,

        // Filtros Económicos
        budgetMin: formData.budgetMin ?? undefined,
        budgetMax: formData.budgetMax ?? undefined,

        // Filtros de Calidad
        onlyWithPhoto: formData.onlyWithPhoto,
        lastActiveWithinDays: formData.lastActiveWithinDays ?? undefined,

        // Dealbreakers
        noCigarettes: formData.noCigarettes,
        noWeed: formData.noWeed,
        noPets: formData.noPets,
        petsRequired: formData.petsRequired,
        requireQuietHoursOverlap: formData.requireQuietHoursOverlap,

        // Preferencias de compatibilidad
        tidinessMin: formData.tidinessMin || undefined,
        schedulePref: formData.schedulePref || undefined,
        guestsMax: formData.guestsMax || undefined,
        musicMax: formData.musicMax || undefined,

        // Nice-to-have
        languagesPref: formData.languagesPref.length > 0 ? formData.languagesPref : undefined,
        interestsPref: formData.interestsPref.length > 0 ? formData.interestsPref : undefined,
        zodiacPref: formData.zodiacPref.length > 0 ? formData.zodiacPref : undefined,
      };

      const updatedData = await searchPreferencesService.upsertSearchPreferences(dataToSave);

      // Actualizar datos iniciales con los datos guardados
      const formattedData = mapApiToFormData(updatedData);
      setInitialData(formattedData);
      setFormData(formattedData);
      setHasChanges(false);
    } catch (error) {
      console.error("❌ Error al guardar preferencias:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, formData, mapApiToFormData]);

  return {
    formData,
    loading,
    saving,
    updateFormData,
    resetFormData,
    saveFormData,
    hasChanges,
  };
};
