import {
  Tidiness,
  Schedule,
  GuestsFreq,
  MusicUsage,
  ZodiacSign,
  Language,
  Interest,
} from "../../../enums/searchPreferences.enums";

export interface RoommatePreferences {
  id: string;
  userId: string;

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

  // Calidad del Feed
  lastActiveWithinDays: number | null;

  // Metadatos
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para crear/actualizar preferencias de roomie
 */
export interface CreateRoommatePreferencesRequest {
  // Dealbreakers
  noCigarettes?: boolean | null;
  noWeed?: boolean | null;
  noPets?: boolean | null;
  petsRequired?: boolean | null;
  requireQuietHoursOverlap?: boolean | null;

  // Preferencias de Vibe
  tidinessMin?: Tidiness | null;
  schedulePref?: Schedule | null;
  guestsMax?: GuestsFreq | null;
  musicMax?: MusicUsage | null;

  // Nice-to-have
  languagesPref?: Language[] | null;
  interestsPref?: Interest[] | null;
  zodiacPref?: ZodiacSign[] | null;

  // Calidad del Feed
  lastActiveWithinDays?: number | null;
}

/**
 * Interface para el formulario de UI de preferencias de roomie
 */
export interface RoommatePreferencesFormData {
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

  // Calidad del Feed
  lastActiveWithinDays: number | null;
}

/**
 * Función helper para crear datos por defecto de preferencias de roomie
 */
export const createDefaultRoommatePreferences = (): RoommatePreferencesFormData => ({
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

  // Calidad del Feed
  lastActiveWithinDays: null,
});
