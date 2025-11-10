import {
  Tidiness,
  Schedule,
  GuestsFreq,
  MusicUsage,
  Cooking,
  SharePolicy,
  SmokesCigarettes,
  SmokesWeed,
  PetsOk,
  Alcohol,
  Diet,
  OccupationStatus,
  WorkMode,
  EducationLevel,
  ZodiacSign,
  GenderPreference,
} from "../../../core/enums/profile.enums";
import { PetType, Language, Interest } from "../enums/searchPreferences.enums";
import {
  PROFILE_TIDINESS_LABELS,
  PROFILE_SCHEDULE_LABELS,
  PROFILE_GUESTS_LABELS,
  PROFILE_MUSIC_USAGE_LABELS,
  PROFILE_COOKING_LABELS,
  PROFILE_SHARE_POLICY_LABELS,
  PROFILE_SMOKES_CIGARETTES_LABELS,
  PROFILE_SMOKES_WEED_LABELS,
  PROFILE_PETS_OK_LABELS,
  PROFILE_ALCOHOL_LABELS,
  PROFILE_DIET_LABELS,
  PROFILE_OCCUPATION_LABELS,
  PROFILE_WORK_MODE_LABELS,
  PROFILE_EDUCATION_LABELS,
  PROFILE_ZODIAC_LABELS,
  PROFILE_GENDER_PREFERENCE_LABELS,
  labelFromRecord,
} from "./profileLabels";

type LabelRecord<T extends string> = Record<T, string>;

export const SEARCH_TIDINESS_LABELS: LabelRecord<Tidiness> = PROFILE_TIDINESS_LABELS;
export const SEARCH_SCHEDULE_LABELS: LabelRecord<Schedule> = PROFILE_SCHEDULE_LABELS;
export const SEARCH_GUESTS_LABELS: LabelRecord<GuestsFreq> = PROFILE_GUESTS_LABELS;
export const SEARCH_MUSIC_USAGE_LABELS: LabelRecord<MusicUsage> = PROFILE_MUSIC_USAGE_LABELS;
export const SEARCH_COOKING_LABELS: LabelRecord<Cooking> = PROFILE_COOKING_LABELS;
export const SEARCH_SHARE_POLICY_LABELS: LabelRecord<SharePolicy> = PROFILE_SHARE_POLICY_LABELS;
export const SEARCH_SMOKES_CIGARETTES_LABELS: LabelRecord<SmokesCigarettes> =
  PROFILE_SMOKES_CIGARETTES_LABELS;
export const SEARCH_SMOKES_WEED_LABELS: LabelRecord<SmokesWeed> = PROFILE_SMOKES_WEED_LABELS;
export const SEARCH_PETS_OK_LABELS: LabelRecord<PetsOk> = PROFILE_PETS_OK_LABELS;
export const SEARCH_ALCOHOL_LABELS: LabelRecord<Alcohol> = PROFILE_ALCOHOL_LABELS;
export const SEARCH_DIET_LABELS: LabelRecord<Diet> = PROFILE_DIET_LABELS;
export const SEARCH_OCCUPATION_LABELS: LabelRecord<OccupationStatus> = PROFILE_OCCUPATION_LABELS;
export const SEARCH_WORK_MODE_LABELS: LabelRecord<WorkMode> = PROFILE_WORK_MODE_LABELS;
export const SEARCH_EDUCATION_LABELS: LabelRecord<EducationLevel> = PROFILE_EDUCATION_LABELS;
export const SEARCH_ZODIAC_LABELS: LabelRecord<ZodiacSign> = PROFILE_ZODIAC_LABELS;
export const SEARCH_GENDER_PREFERENCE_LABELS: LabelRecord<GenderPreference> =
  PROFILE_GENDER_PREFERENCE_LABELS;

export const SEARCH_PET_TYPE_LABELS: LabelRecord<PetType> = {
  [PetType.DOG]: "Perro",
  [PetType.CAT]: "Gato",
  [PetType.BIRD]: "Ave",
  [PetType.FISH]: "Pez",
  [PetType.OTHER]: "Otra",
};

export const SEARCH_LANGUAGE_LABELS: LabelRecord<Language> = {
  [Language.SPANISH]: "Español",
  [Language.ENGLISH]: "Inglés",
  [Language.PORTUGUESE]: "Portugués",
  [Language.FRENCH]: "Francés",
  [Language.ITALIAN]: "Italiano",
  [Language.GERMAN]: "Alemán",
  [Language.OTHER]: "Otro",
};

export const SEARCH_INTEREST_LABELS: LabelRecord<Interest> = {
  [Interest.GAMING]: "Videojuegos",
  [Interest.READING]: "Lectura",
  [Interest.COOKING]: "Cocina",
  [Interest.SPORTS]: "Deportes",
  [Interest.MUSIC]: "Música",
  [Interest.TRAVEL]: "Viajes",
  [Interest.ART]: "Arte",
  [Interest.TECHNOLOGY]: "Tecnología",
  [Interest.FITNESS]: "Fitness",
  [Interest.PHOTOGRAPHY]: "Fotografía",
  [Interest.MOVIES]: "Cine",
  [Interest.DANCE]: "Danza",
  [Interest.OTHER]: "Otro",
};

export { labelFromRecord };
