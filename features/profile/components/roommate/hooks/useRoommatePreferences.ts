import { getCachedValue, setCachedValue } from "../../../../../services/resilience/cache";
import { useDataPreload } from "../../../../../context/DataPreloadContext";
import { useCachedProfile } from "../../../hooks/useCachedProfile";
import { roommatePreferencesAdapter } from "../../../adapters";
import { useAuth } from "../../../../../context/AuthContext";
import { searchPreferencesService } from "../../../services";
import { useCallback, useEffect, useState } from "react";
import {
  RoommatePreferencesFormData,
  createDefaultRoommatePreferences,
  RoommatePreferences,
  CreateRoommatePreferencesRequest,
} from "../interfaces";

export interface UseRoommatePreferencesReturn {
  formData: RoommatePreferencesFormData;
  loading: boolean;
  saving: boolean;
  updateFormData: (field: keyof RoommatePreferencesFormData, value: any) => void;
  resetFormData: () => void;
  reinitializeFormData: () => Promise<void>;
  saveFormData: () => Promise<void>;
  hasChanges: boolean;
}

export const useRoommatePreferences = (): UseRoommatePreferencesReturn => {
  const { user } = useAuth();
  const { fullProfile } = useCachedProfile();
  const { refreshProfile } = useDataPreload();
  const defaultPrefs = createDefaultRoommatePreferences();
  const [formData, setFormData] = useState<RoommatePreferencesFormData>(defaultPrefs);
  const [initialData, setInitialData] = useState<RoommatePreferencesFormData>(defaultPrefs);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const mapCachedToApiData = useCallback((cachedData: any): RoommatePreferences | null => {
    if (!cachedData) return null;

    return {
      id: cachedData.id ?? "",
      userId: cachedData.userId ?? "",
      // Dealbreakers
      noCigarettes: cachedData.noCigarettes ?? null,
      noWeed: cachedData.noWeed ?? null,
      noPets: cachedData.noPets ?? null,
      petsRequired: cachedData.petsRequired ?? null,
      requireQuietHoursOverlap: cachedData.requireQuietHoursOverlap ?? null,
      // Preferencias de Vibe
      tidinessMin: cachedData.tidinessMin ?? null,
      schedulePref: cachedData.schedulePref ?? null,
      guestsMax: cachedData.guestsMax ?? null,
      musicMax: cachedData.musicMax ?? null,
      // Nice-to-have
      languagesPref: cachedData.languagesPref ?? null,
      interestsPref: cachedData.interestsPref ?? null,
      zodiacPref: cachedData.zodiacPref ?? null,
      // Calidad del Feed
      lastActiveWithinDays: cachedData.lastActiveWithinDays ?? null,
      createdAt: cachedData.createdAt ?? new Date().toISOString(),
      updatedAt: cachedData.updatedAt ?? new Date().toISOString(),
    };
  }, []);

  const loadPreferences = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!user) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        if (!forceRefresh && fullProfile?.searchPreferences) {
          const apiData = mapCachedToApiData(fullProfile.searchPreferences);
          if (apiData) {
            const formattedData = roommatePreferencesAdapter.mapApiToFormData(apiData);
            setFormData(formattedData);
            setInitialData(formattedData);
            setLoading(false);
            setInitialized(true);
            return;
          }
        }

        if (!forceRefresh) {
          const cachedData = await getCachedValue<RoommatePreferences>("/search-preferences/me");
          if (cachedData) {
            const formattedData = roommatePreferencesAdapter.mapApiToFormData(cachedData);
            setFormData(formattedData);
            setInitialData(formattedData);
            setLoading(false);
            setInitialized(true);
            return;
          }
        }

        setLoading(true);
        const apiData = await searchPreferencesService.getSearchPreferences();
        const mappedData = mapCachedToApiData(apiData);
        if (mappedData) {
          const formattedData = roommatePreferencesAdapter.mapApiToFormData(mappedData);
          setFormData(formattedData);
          setInitialData(formattedData);
        } else {
          setFormData(defaultPrefs);
          setInitialData(defaultPrefs);
        }
        setInitialized(true);
      } catch (error) {
        console.error("Error loading roommate preferences:", error);
        const defaultData = createDefaultRoommatePreferences();
        setFormData(defaultData);
        setInitialData(defaultData);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    },
    [user, mapCachedToApiData, fullProfile, defaultPrefs],
  );

  useEffect(() => {
    if (!initialized) {
      loadPreferences(false);
    }
  }, [initialized, loadPreferences]);

  const reinitializeFormData = useCallback(async () => {
    await loadPreferences(true);
  }, [loadPreferences]);

  const updateFormData = useCallback(
    (field: keyof RoommatePreferencesFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        // Detectar cambios comparando con los datos iniciales
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
      const dataToSave: CreateRoommatePreferencesRequest =
        roommatePreferencesAdapter.mapFormDataToApi(formData);

      const updatedData = await searchPreferencesService.upsertSearchPreferences(dataToSave);

      const mappedData = mapCachedToApiData(updatedData);
      if (mappedData) {
        const formattedData = roommatePreferencesAdapter.mapApiToFormData(mappedData);
        const mergedData: RoommatePreferencesFormData = {
          ...formData,
          ...formattedData,
          tidinessMin: formattedData.tidinessMin || formData.tidinessMin,
          schedulePref: formattedData.schedulePref || formData.schedulePref,
          guestsMax: formattedData.guestsMax || formData.guestsMax,
          musicMax: formattedData.musicMax || formData.musicMax,
          languagesPref:
            formattedData.languagesPref && formattedData.languagesPref.length > 0
              ? formattedData.languagesPref
              : formData.languagesPref,
          interestsPref:
            formattedData.interestsPref && formattedData.interestsPref.length > 0
              ? formattedData.interestsPref
              : formData.interestsPref,
          zodiacPref:
            formattedData.zodiacPref && formattedData.zodiacPref.length > 0
              ? formattedData.zodiacPref
              : formData.zodiacPref,
        };
        setInitialData(mergedData);
        setFormData(mergedData);
      }
      setHasChanges(false);
      await refreshProfile();
    } catch (error) {
      console.error("❌ Error al guardar preferencias de roomie:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, formData, mapCachedToApiData, refreshProfile]);

  return {
    formData,
    loading,
    saving,
    updateFormData,
    resetFormData,
    reinitializeFormData,
    saveFormData,
    hasChanges,
  };
};
