import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { SearchPreferences, CreateSearchPreferencesRequest } from "../interfaces";
import { searchPreferencesService } from "../services";

export interface UseSearchPreferencesReturn {
  preferences: SearchPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadPreferences: () => Promise<void>;
  savePreferences: (data: CreateSearchPreferencesRequest) => Promise<void>;
  deletePreferences: () => Promise<void>;
}

export const useSearchPreferences = (): UseSearchPreferencesReturn => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<SearchPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!user) {
      setError("Usuario no autenticado");
      return;
    }

    const hasFilters = user.filters && Object.keys(user.filters).length > 0;
    if (!hasFilters) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchPreferencesService.getSearchPreferences();
      setPreferences(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) {
        setPreferences(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar preferencias";
        setError(errorMessage);
        console.error("❌ Error loading search preferences:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(
    async (data: CreateSearchPreferencesRequest) => {
      if (!user) {
        setError("Usuario no autenticado");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const updatedPreferences = await searchPreferencesService.upsertSearchPreferences(data);
        setPreferences(updatedPreferences);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al guardar preferencias";
        setError(errorMessage);
        console.error("Error saving search preferences:", err);
        throw err; // Re-throw para que el componente pueda manejarlo
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  const deletePreferences = useCallback(async () => {
    if (!user) {
      setError("Usuario no autenticado");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await searchPreferencesService.deleteSearchPreferences();
      setPreferences(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar preferencias";
      setError(errorMessage);
      console.error("Error deleting search preferences:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Cargar preferencias automáticamente cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    error,
    loadPreferences,
    savePreferences,
    deletePreferences,
  };
};
