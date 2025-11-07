import {
  Tidiness,
  Schedule,
  GuestsFreq,
  MusicUsage,
  ZodiacSign,
  Language,
  Interest,
  GenderPreference,
} from "../enums/searchPreferences.enums";

export interface SearchPreferences {
  id: string;
  userId: string;

  // Filtros de Ubicación
  mainPreferredNeighborhoodId: string | null;
  preferredNeighborhoods: string[] | null;
  includeAdjacentNeighborhoods: boolean | null;

  // Filtros Demográficos
  genderPref: GenderPreference[] | null;
  minAge: number | null;
  maxAge: number | null;

  // Filtros Económicos
  budgetMin: number | null;
  budgetMax: number | null;

  // Filtros de Calidad
  onlyWithPhoto: boolean | null;
  lastActiveWithinDays: number | null;

  // Dealbreakers (Preferencias Estrictas)
  noCigarettes: boolean | null;
  noWeed: boolean | null;
  noPets: boolean | null;
  petsRequired: boolean | null;
  requireQuietHoursOverlap: boolean | null;

  // Preferencias de Vibe (Rangos)
  tidinessMin: Tidiness | null;
  schedulePref: Schedule | null;
  guestsMax: GuestsFreq | null;
  musicMax: MusicUsage | null;

  // Nice-to-have (Preferencias Suaves)
  languagesPref: Language[] | null;
  interestsPref: Interest[] | null;
  zodiacPref: ZodiacSign[] | null;

  // Metadatos
  createdAt: string;
  updatedAt: string;
}

export interface CreateSearchPreferencesRequest {
  // Filtros de Ubicación
  mainPreferredNeighborhoodId?: string;
  preferredNeighborhoods?: string[];
  includeAdjacentNeighborhoods?: boolean;

  // Filtros Demográficos
  genderPref?: GenderPreference[];
  minAge?: number;
  maxAge?: number;

  // Filtros Económicos
  budgetMin?: number;
  budgetMax?: number;

  // Filtros de Calidad
  onlyWithPhoto?: boolean;
  lastActiveWithinDays?: number;

  // Dealbreakers (Preferencias Estrictas)
  noCigarettes?: boolean;
  noWeed?: boolean;
  noPets?: boolean;
  petsRequired?: boolean;
  requireQuietHoursOverlap?: boolean;

  // Preferencias de Vibe (Rangos)
  tidinessMin?: Tidiness;
  schedulePref?: Schedule;
  guestsMax?: GuestsFreq;
  musicMax?: MusicUsage;

  // Nice-to-have (Preferencias Suaves)
  languagesPref?: Language[];
  interestsPref?: Interest[];
  zodiacPref?: ZodiacSign[];
}

export interface UpdateSearchPreferencesRequest extends CreateSearchPreferencesRequest {}

// Tipos para validaciones
export interface SearchPreferencesValidation {
  isValid: boolean;
  errors: string[];
}

// Tipos para el formulario de UI
export interface SearchPreferencesFormData {
  // Filtros de Ubicación
  mainPreferredNeighborhoodId: string;
  preferredNeighborhoods: string[];
  includeAdjacentNeighborhoods: boolean;

  // Filtros Demográficos
  genderPref: GenderPreference[];
  minAge: number | null;
  maxAge: number | null;

  // Filtros Económicos
  budgetMin: number | null;
  budgetMax: number | null;

  // Filtros de Calidad
  onlyWithPhoto: boolean;
  lastActiveWithinDays: number | null;

  // Dealbreakers
  noCigarettes: boolean;
  noWeed: boolean;
  noPets: boolean;
  petsRequired: boolean;
  requireQuietHoursOverlap: boolean;

  // Preferencias de Vibe
  tidinessMin: Tidiness | "";
  schedulePref: Schedule | "";
  guestsMax: GuestsFreq | "";
  musicMax: MusicUsage | "";

  // Nice-to-have
  languagesPref: Language[];
  interestsPref: Interest[];
  zodiacPref: ZodiacSign[];
}

// Constantes para validaciones
export const SEARCH_PREFERENCES_CONSTANTS = {
  // Rango de edad
  MIN_AGE: 18,
  MAX_AGE: 100,

  // Presupuesto (en UYU)
  MIN_BUDGET: 1000,
  MAX_BUDGET: 200000,

  // Días de actividad
  MIN_ACTIVE_DAYS: 1,
  MAX_ACTIVE_DAYS: 365,

  // Límites de arrays
  MAX_NEIGHBORHOODS: 20,
  MAX_GENDER_PREFS: 3,
  MAX_INTERESTS: 10,
  MAX_LANGUAGES: 5,
  MAX_ZODIAC_SIGNS: 12,
} as const;

// Función helper para crear datos por defecto
export const createDefaultSearchPreferences = (): SearchPreferencesFormData => ({
  // Filtros de Ubicación
  mainPreferredNeighborhoodId: "",
  preferredNeighborhoods: [],
  includeAdjacentNeighborhoods: false,

  // Filtros Demográficos
  genderPref: [],
  minAge: 18,
  maxAge: 50,

  // Filtros Económicos
  budgetMin: 10000,
  budgetMax: 50000,

  // Filtros de Calidad
  onlyWithPhoto: true,
  lastActiveWithinDays: 30,

  // Dealbreakers
  noCigarettes: false,
  noWeed: false,
  noPets: false,
  petsRequired: false,
  requireQuietHoursOverlap: false,

  // Preferencias de Vibe
  tidinessMin: "",
  schedulePref: "",
  guestsMax: "",
  musicMax: "",

  // Nice-to-have
  languagesPref: [],
  interestsPref: [],
  zodiacPref: [],
});
