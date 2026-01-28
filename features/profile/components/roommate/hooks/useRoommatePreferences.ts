import { useDataPreload } from "../../../../../context/DataPreloadContext";
import { getCachedValue } from "../../../../../services/resilience/cache";
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
  getChanges: () => Partial<CreateRoommatePreferencesRequest>;
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

      const hasFilters = user.filters && Object.keys(user.filters).length > 0;
      if (!hasFilters) {
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

  const getChanges = useCallback((): Partial<CreateRoommatePreferencesRequest> => {
    const changes: Partial<CreateRoommatePreferencesRequest> = {};
    let hasDiff = false;

    (Object.keys(formData) as (keyof RoommatePreferencesFormData)[]).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])) {
        changes[key] = formData[key] as any;
        hasDiff = true;
      }
    });

    return hasDiff ? changes : {};
  }, [formData, initialData]);

  const saveFormData = useCallback(async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const changes = getChanges();
    if (Object.keys(changes).length === 0) {
      return;
    }

    setSaving(true);
    try {
      const fullApiData = roommatePreferencesAdapter.mapFormDataToApi(formData);
      const initialApiData = roommatePreferencesAdapter.mapFormDataToApi(initialData);

      const apiChanges: any = {};
      Object.keys(fullApiData).forEach(k => {
        const key = k as keyof CreateRoommatePreferencesRequest;
        if (JSON.stringify(fullApiData[key]) !== JSON.stringify(initialApiData[key])) {
          apiChanges[key] = fullApiData[key];
        }
      });

      if (Object.keys(apiChanges).length === 0) return;

      const updatedData = await searchPreferencesService.upsertSearchPreferences(apiChanges);

      const mappedData = mapCachedToApiData(updatedData);
      if (mappedData) {
        const formattedData = roommatePreferencesAdapter.mapApiToFormData(mappedData);
        const mergedData: RoommatePreferencesFormData = {
          ...formData,
          ...formattedData,
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
  }, [user, formData, initialData, getChanges, mapCachedToApiData, refreshProfile]);

  return {
    formData,
    loading,
    saving,
    updateFormData,
    resetFormData,
    reinitializeFormData,
    saveFormData,
    hasChanges,
    getChanges,
  };
};
