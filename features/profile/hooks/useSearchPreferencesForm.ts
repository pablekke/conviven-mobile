import { getCachedValue, setCachedValue } from "../../../services/resilience/cache";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { searchPreferencesService } from "../services";
import { searchPreferencesAdapter } from "../adapters";
import { useCachedProfile } from "./useCachedProfile";
import { useDataPreload } from "../../../context/DataPreloadContext";
import {
  SearchPreferencesFormData,
  createDefaultSearchPreferences,
  SearchPreferences,
} from "../interfaces";

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
  const { fullProfile } = useCachedProfile();
  const { refreshProfile } = useDataPreload();
  const defaultPrefs = createDefaultSearchPreferences();
  const [formData, setFormData] = useState<SearchPreferencesFormData>(defaultPrefs);
  const [initialData, setInitialData] = useState<SearchPreferencesFormData>(defaultPrefs);
  // Inicializar loading en false para evitar spinners si hay datos en cache
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const mapCachedToApiData = useCallback((cachedData: any): SearchPreferences | null => {
    if (!cachedData) return null;

    return {
      id: cachedData.id ?? "",
      userId: cachedData.userId ?? "",
      mainPreferredNeighborhoodId: cachedData.mainPreferredNeighborhoodId ?? null,
      preferredNeighborhoods: cachedData.preferredNeighborhoods ?? null,
      includeAdjacentNeighborhoods: cachedData.includeAdjacentNeighborhoods ?? null,
      genderPref: cachedData.genderPref ?? null,
      minAge: cachedData.minAge ?? null,
      maxAge: cachedData.maxAge ?? null,
      budgetMin: cachedData.budgetMin ?? null,
      budgetMax: cachedData.budgetMax ?? null,
      onlyWithPhoto: cachedData.onlyWithPhoto ?? null,
      lastActiveWithinDays: cachedData.lastActiveWithinDays ?? null,
      noCigarettes: cachedData.noCigarettes ?? null,
      noWeed: cachedData.noWeed ?? null,
      noPets: cachedData.noPets ?? null,
      petsRequired: cachedData.petsRequired ?? null,
      requireQuietHoursOverlap: cachedData.requireQuietHoursOverlap ?? null,
      tidinessMin: (cachedData.tidinessMin as any) ?? null,
      schedulePref: (cachedData.schedulePref as any) ?? null,
      guestsMax: (cachedData.guestsMax as any) ?? null,
      musicMax: (cachedData.musicMax as any) ?? null,
      languagesPref: cachedData.languagesPref ?? null,
      interestsPref: cachedData.interestsPref ?? null,
      zodiacPref: cachedData.zodiacPref ?? null,
      createdAt: cachedData.createdAt ?? new Date().toISOString(),
      updatedAt: cachedData.updatedAt ?? new Date().toISOString(),
    };
  }, []);

  // Cargar datos iniciales desde cache o API
  useEffect(() => {
    const loadPreferences = async (forceRefresh: boolean = false) => {
      if (!user) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        // Primero intentar usar datos del fullProfile cache (ya precargados)
        if (!forceRefresh && fullProfile?.searchPreferences) {
          const apiData = mapCachedToApiData(fullProfile.searchPreferences);
          if (apiData) {
            const formattedData = searchPreferencesAdapter.mapApiToFormData(apiData);
            setFormData(formattedData);
            setInitialData(formattedData);
            setLoading(false);
            setInitialized(true);
            // Hacer refresh en background para mantener datos actualizados
            searchPreferencesService
              .getSearchPreferences()
              .then(data => {
                const updatedFormattedData = searchPreferencesAdapter.mapApiToFormData(data);
                setFormData(updatedFormattedData);
                setInitialData(updatedFormattedData);
              })
              .catch(error => {
                console.error("Error refreshing search preferences in background:", error);
              });
            return;
          }
        }

        // Segundo intentar usar cache de API
        if (!forceRefresh) {
          const cachedData = await getCachedValue<SearchPreferences>("/search-preferences/me");
          if (cachedData) {
            const formattedData = searchPreferencesAdapter.mapApiToFormData(cachedData);
            setFormData(formattedData);
            setInitialData(formattedData);
            setLoading(false);
            setInitialized(true);
            // Hacer refresh en background
            searchPreferencesService
              .getSearchPreferences()
              .then(data => {
                const updatedFormattedData = searchPreferencesAdapter.mapApiToFormData(data);
                setFormData(updatedFormattedData);
                setInitialData(updatedFormattedData);
              })
              .catch(error => {
                console.error("Error refreshing search preferences in background:", error);
              });
            return;
          }
        }

        // Solo mostrar loading si no hay cache disponible
        setLoading(true);
        const apiData = await searchPreferencesService.getSearchPreferences();
        const formattedData = searchPreferencesAdapter.mapApiToFormData(apiData);
        setFormData(formattedData);
        setInitialData(formattedData);
        setInitialized(true);
      } catch (error) {
        const defaultData = createDefaultSearchPreferences();
        setFormData(defaultData);
        setInitialData(defaultData);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      loadPreferences(false);
    }
  }, [user, mapCachedToApiData, fullProfile, initialized]);

  const updateFormData = useCallback(
    (field: keyof SearchPreferencesFormData, value: any) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        const changed = JSON.stringify(newData) !== JSON.stringify(initialData);
        setHasChanges(changed);

        if (changed) {
          setCachedValue("@searchPrefs/draft", newData).catch(error => {
            console.warn("Error guardando draft en cache:", error);
          });
        }

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
      const formattedData = searchPreferencesAdapter.mapApiToFormData(updatedData);
      setInitialData(formattedData);
      setFormData(formattedData);
      setHasChanges(false);
      await refreshProfile();
    } catch (error) {
      console.error("❌ Error al guardar preferencias:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user, formData]);

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
