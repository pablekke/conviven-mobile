import { Language, Interest, ZodiacSign } from "../../../enums/searchPreferences.enums";
import { QUESTION_OPTIONS } from "../../../constants/questionOptions";
import { useRoommatePreferences } from "./useRoommatePreferences";
import { useEffect, useCallback } from "react";
import {
  SEARCH_LANGUAGE_LABELS,
  SEARCH_INTEREST_LABELS,
  SEARCH_ZODIAC_LABELS,
} from "../../../i18n/searchProfileLabels";

// Mapeo de códigos cortos a valores del enum
const LANGUAGE_CODE_MAP: Record<string, Language> = {
  es: Language.SPANISH,
  en: Language.ENGLISH,
  pt: Language.PORTUGUESE,
  fr: Language.FRENCH,
  it: Language.ITALIAN,
  de: Language.GERMAN,
};

const INTEREST_CODE_MAP: Record<string, Interest> = {
  gaming: Interest.GAMING,
  reading: Interest.READING,
  cooking: Interest.COOKING,
  sports: Interest.SPORTS,
  music: Interest.MUSIC,
  travel: Interest.TRAVEL,
  art: Interest.ART,
  technology: Interest.TECHNOLOGY,
  fitness: Interest.FITNESS,
  photography: Interest.PHOTOGRAPHY,
  movies: Interest.MOVIES,
  dance: Interest.DANCE,
  cine: Interest.MOVIES, // Alias común
  música: Interest.MUSIC, // Alias común
};

// Función helper para normalizar valores de la API a valores del enum
const normalizeLanguage = (value: string): Language => {
  const lower = value.toLowerCase();
  if (LANGUAGE_CODE_MAP[lower]) return LANGUAGE_CODE_MAP[lower];
  // Buscar por valor exacto (ignorando case) en el enum
  const enumValues = Object.values(Language);
  const matched = enumValues.find(v => v.toLowerCase() === lower);
  return (matched || value) as Language;
};

const normalizeInterest = (value: string): Interest => {
  const lower = value.toLowerCase();
  if (INTEREST_CODE_MAP[lower]) return INTEREST_CODE_MAP[lower];
  // Buscar por valor exacto (ignorando case) en el enum
  const enumValues = Object.values(Interest);
  const matched = enumValues.find(v => v.toLowerCase() === lower);
  return (matched || value) as Interest;
};

export const findOptionLabel = (
  value: string,
  options: { value: string; label: string }[],
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label ?? "";
};

export interface UseRoommatePreferencesLogicReturn {
  // Estado y datos
  roommatePrefsData: ReturnType<typeof useRoommatePreferences>["formData"];
  roommatePrefsHasChanges: boolean;
  roommatePrefsSaving: boolean;
  roommatePrefsLoading: boolean;

  // Funciones de actualización
  updateRoommatePreference: (question: string, value: string) => void;

  // Funciones de guardado y reset
  saveRoommatePrefs: () => Promise<void>;
  resetRoommatePrefs: () => void;
  reinitializeRoommatePrefs: () => Promise<void>;

  // Funciones para mapear a selectedAnswers
  mapRoommatePrefsToSelectedAnswers: () => Record<string, string>;
  resetRoommatePrefsInSelectedAnswers: () => Record<string, string>;
}

/**
 * Hook que maneja toda la lógica relacionada con roommate preferences
 * Incluye mapeo a selectedAnswers, actualizaciones, y gestión de estado
 */
export const useRoommatePreferencesLogic = (
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>,
): UseRoommatePreferencesLogicReturn => {
  const {
    formData: roommatePrefsData,
    saving: roommatePrefsSaving,
    loading: roommatePrefsLoading,
    updateFormData: updateRoommatePrefs,
    resetFormData: resetRoommatePrefs,
    reinitializeFormData: reinitializeRoommatePrefs,
    saveFormData: saveRoommatePrefs,
    hasChanges: roommatePrefsHasChanges,
  } = useRoommatePreferences();

  // Mapear roommate preferences a selectedAnswers cuando cambian los datos
  useEffect(() => {
    if (roommatePrefsData) {
      const mapped = mapRoommatePrefsToSelectedAnswers();
      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [roommatePrefsData, setSelectedAnswers]);

  /**
   * Mapea los datos de roommate preferences a formato selectedAnswers
   */
  const mapRoommatePrefsToSelectedAnswers = useCallback((): Record<string, string> => {
    const mapped: Record<string, string> = {};

    if (!roommatePrefsData) return mapped;

    mapped.noCigarettes =
      findOptionLabel(
        roommatePrefsData.noCigarettes ? "true" : "false",
        QUESTION_OPTIONS.noCigarettes,
      ) || "Seleccionar";

    mapped.noWeed =
      findOptionLabel(roommatePrefsData.noWeed ? "true" : "false", QUESTION_OPTIONS.noWeed) ||
      "Seleccionar";

    const petsValue = roommatePrefsData.noPets
      ? "noPets"
      : roommatePrefsData.petsRequired
        ? "petsRequired"
        : "none";
    mapped.petsPreference =
      findOptionLabel(petsValue, QUESTION_OPTIONS.petsPreference) || "Seleccionar";

    if (roommatePrefsData.tidinessMin) {
      const val = roommatePrefsData.tidinessMin;
      const option = QUESTION_OPTIONS.tidinessMin.find(
        opt => opt.value === val || opt.value.toLowerCase() === val.toLowerCase(),
      );
      mapped.tidinessMin = option?.label || "Seleccionar";
    }

    if (roommatePrefsData.schedulePref) {
      const val = roommatePrefsData.schedulePref;
      const option = QUESTION_OPTIONS.schedulePref.find(
        opt => opt.value === val || opt.value.toLowerCase() === val.toLowerCase(),
      );
      mapped.schedulePref = option?.label || "Seleccionar";
    }

    if (roommatePrefsData.guestsMax) {
      const val = roommatePrefsData.guestsMax;
      const option = QUESTION_OPTIONS.guestsMax.find(
        opt => opt.value === val || opt.value.toLowerCase() === val.toLowerCase(),
      );
      mapped.guestsMax = option?.label || "Seleccionar";
    }

    if (roommatePrefsData.musicMax) {
      const val = roommatePrefsData.musicMax;
      const option = QUESTION_OPTIONS.musicMax.find(
        opt => opt.value === val || opt.value.toLowerCase() === val.toLowerCase(),
      );
      mapped.musicMax = option?.label || "Seleccionar";
    }

    // Nice-to-have - mapear arrays a strings separados por comas
    if (roommatePrefsData.languagesPref && roommatePrefsData.languagesPref.length > 0) {
      mapped.languagesPref = roommatePrefsData.languagesPref
        .map(lang => {
          const normalized = normalizeLanguage(lang);
          return SEARCH_LANGUAGE_LABELS[normalized] || lang;
        })
        .join(", ");
    } else {
      mapped.languagesPref = "Seleccionar";
    }

    if (roommatePrefsData.interestsPref && roommatePrefsData.interestsPref.length > 0) {
      mapped.interestsPref = roommatePrefsData.interestsPref
        .map(interest => {
          const normalized = normalizeInterest(interest);
          return SEARCH_INTEREST_LABELS[normalized] || interest;
        })
        .join(", ");
    } else {
      mapped.interestsPref = "Seleccionar";
    }

    if (roommatePrefsData.zodiacPref && roommatePrefsData.zodiacPref.length > 0) {
      mapped.zodiacPref = roommatePrefsData.zodiacPref
        .map(zodiac => {
          // Normalizar zodiac signs (pueden venir en diferentes formatos)
          const upper = zodiac.toUpperCase();
          const enumValues = Object.values(ZodiacSign);
          const matched = enumValues.find(v => v.toUpperCase() === upper);
          const finalValue = matched || zodiac;
          return SEARCH_ZODIAC_LABELS[finalValue as ZodiacSign] || finalValue;
        })
        .join(", ");
    } else {
      mapped.zodiacPref = "Seleccionar";
    }

    return mapped;
  }, [roommatePrefsData]);

  /**
   * Resetea los roommate preferences en selectedAnswers
   */
  const resetRoommatePrefsInSelectedAnswers = useCallback((): Record<string, string> => {
    return mapRoommatePrefsToSelectedAnswers();
  }, [mapRoommatePrefsToSelectedAnswers]);

  /**
   * Actualiza una preferencia de roommate basada en la pregunta y valor
   */
  const updateRoommatePreference = useCallback(
    (question: string, value: string) => {
      if (question === "noCigarettes") {
        updateRoommatePrefs("noCigarettes", value === "true");
      } else if (question === "noWeed") {
        updateRoommatePrefs("noWeed", value === "true");
      } else if (question === "petsPreference") {
        updateRoommatePrefs("noPets", value === "noPets");
        updateRoommatePrefs("petsRequired", value === "petsRequired");
      } else if (["tidinessMin", "schedulePref", "guestsMax", "musicMax"].includes(question)) {
        updateRoommatePrefs(question as any, value);
      } else if (question === "languagesPref") {
        // Toggle: agregar si no está, remover si está
        // Normalizar valores actuales para comparar correctamente
        const current = roommatePrefsData?.languagesPref || [];
        const normalizedCurrent = current.map(lang => normalizeLanguage(lang));
        const normalizedValue = normalizeLanguage(value);
        const newArray = normalizedCurrent.includes(normalizedValue)
          ? current.filter(lang => normalizeLanguage(lang) !== normalizedValue)
          : [...current, normalizedValue];
        updateRoommatePrefs("languagesPref", newArray);
      } else if (question === "interestsPref") {
        // Toggle: agregar si no está, remover si está
        // Normalizar valores actuales para comparar correctamente
        const current = roommatePrefsData?.interestsPref || [];
        const normalizedCurrent = current.map(interest => normalizeInterest(interest));
        const normalizedValue = normalizeInterest(value);
        const newArray = normalizedCurrent.includes(normalizedValue)
          ? current.filter(interest => normalizeInterest(interest) !== normalizedValue)
          : [...current, normalizedValue];
        updateRoommatePrefs("interestsPref", newArray);
      } else if (question === "zodiacPref") {
        // Toggle: agregar si no está, remover si está
        const current = roommatePrefsData?.zodiacPref || [];
        // Normalizar zodiac signs
        const normalizeZodiac = (z: string): string => {
          const upper = z.toUpperCase();
          if (Object.values(ZodiacSign).includes(upper as ZodiacSign)) return upper;
          return z;
        };
        const normalizedCurrent = current.map(z => normalizeZodiac(z));
        const normalizedValue = normalizeZodiac(value);
        const newArray = normalizedCurrent.includes(normalizedValue)
          ? current.filter(zodiac => normalizeZodiac(zodiac) !== normalizedValue)
          : [...current, normalizedValue];
        updateRoommatePrefs("zodiacPref", newArray);
      }
    },
    [updateRoommatePrefs, roommatePrefsData],
  );

  return {
    roommatePrefsData,
    roommatePrefsHasChanges,
    roommatePrefsSaving,
    roommatePrefsLoading,
    updateRoommatePreference,
    saveRoommatePrefs,
    resetRoommatePrefs,
    reinitializeRoommatePrefs,
    mapRoommatePrefsToSelectedAnswers,
    resetRoommatePrefsInSelectedAnswers,
  };
};
