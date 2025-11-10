import {
  Gender,
  GenderPreference,
  Tidiness,
  Schedule,
  GuestsFreq,
  MusicUsage,
  SmokesCigarettes,
  SmokesWeed,
  PetsOk,
  Alcohol,
  Diet,
  Cooking,
  SharePolicy,
  OccupationStatus,
  WorkMode,
  EducationLevel,
  ZodiacSign,
} from "../../../core/enums/profile.enums";

type LabelRecord<T extends string> = Record<T, string>;

export const PROFILE_GENDER_LABELS: LabelRecord<Gender> = {
  [Gender.MALE]: "Hombre",
  [Gender.FEMALE]: "Mujer",
  [Gender.NON_BINARY]: "No binario",
  [Gender.UNSPECIFIED]: "Sin especificar",
};

export const PROFILE_GENDER_PREFERENCE_LABELS: LabelRecord<GenderPreference> = {
  [GenderPreference.MALE]: "Prefiere hombres",
  [GenderPreference.FEMALE]: "Prefiere mujeres",
  [GenderPreference.NON_BINARY]: "Prefiere no binario",
  [GenderPreference.UNSPECIFIED]: "Sin preferencia",
  [GenderPreference.MOSTLY_MEN]: "Mayormente hombres",
  [GenderPreference.MOSTLY_WOMEN]: "Mayormente mujeres",
  [GenderPreference.ANY]: "Cualquier género",
};

export const PROFILE_TIDINESS_LABELS: LabelRecord<Tidiness> = {
  [Tidiness.CHILL]: "Relajada",
  [Tidiness.AVERAGE]: "Normal",
  [Tidiness.NEAT]: "Muy ordenada",
};

export const PROFILE_SCHEDULE_LABELS: LabelRecord<Schedule> = {
  [Schedule.EARLY_BIRD]: "Madrugadora",
  [Schedule.MIXED]: "Horarios mixtos",
  [Schedule.NIGHT_OWL]: "Nocturna",
};

export const PROFILE_GUESTS_LABELS: LabelRecord<GuestsFreq> = {
  [GuestsFreq.RARELY]: "Visitas raras",
  [GuestsFreq.SOMETIMES]: "Visitas ocasionales",
  [GuestsFreq.WEEKLY_PLUS]: "Visitas frecuentes",
};

export const PROFILE_MUSIC_USAGE_LABELS: LabelRecord<MusicUsage> = {
  [MusicUsage.HEADPHONES]: "Solo auriculares",
  [MusicUsage.SPEAKER_DAY]: "Parlantes de día",
  [MusicUsage.SPEAKER_FLEX]: "Parlantes flexibles",
};

export const PROFILE_SMOKES_CIGARETTES_LABELS: LabelRecord<SmokesCigarettes> = {
  [SmokesCigarettes.NO]: "No fuma",
  [SmokesCigarettes.SOCIALLY]: "Fuma socialmente",
  [SmokesCigarettes.REGULAR]: "Fuma con frecuencia",
};

export const PROFILE_SMOKES_WEED_LABELS: LabelRecord<SmokesWeed> = {
  [SmokesWeed.NO]: "No consume cannabis",
  [SmokesWeed.SOCIALLY]: "Cannabis social",
  [SmokesWeed.REGULAR]: "Cannabis regular",
};

export const PROFILE_PETS_OK_LABELS: LabelRecord<PetsOk> = {
  [PetsOk.NO]: "Sin mascotas",
  [PetsOk.CATS_OK]: "Acepta gatos",
  [PetsOk.DOGS_OK]: "Acepta perros",
  [PetsOk.CATS_DOGS_OK]: "Acepta gatos y perros",
};

export const PROFILE_ALCOHOL_LABELS: LabelRecord<Alcohol> = {
  [Alcohol.NO]: "No bebe alcohol",
  [Alcohol.SOCIALLY]: "Bebe socialmente",
  [Alcohol.REGULAR]: "Bebe con frecuencia",
};

export const PROFILE_DIET_LABELS: LabelRecord<Diet> = {
  [Diet.NONE]: "Sin dieta especial",
  [Diet.VEGETARIAN]: "Vegetariana",
  [Diet.VEGAN]: "Vegana",
  [Diet.OTHER]: "Otra dieta",
};

export const PROFILE_COOKING_LABELS: LabelRecord<Cooking> = {
  [Cooking.RARE]: "Cocina poco",
  [Cooking.SOMETIMES]: "Cocina a veces",
  [Cooking.OFTEN]: "Cocina seguido",
};

export const PROFILE_SHARE_POLICY_LABELS: LabelRecord<SharePolicy> = {
  [SharePolicy.STRICT]: "No comparto",
  [SharePolicy.ASK_FIRST]: "Preguntar primero",
  [SharePolicy.BASIC_SHARED]: "Comparto básicos",
};

export const PROFILE_OCCUPATION_LABELS: LabelRecord<OccupationStatus> = {
  [OccupationStatus.STUDENT]: "Estudiante",
  [OccupationStatus.EMPLOYED]: "Empleado",
  [OccupationStatus.FREELANCE]: "Freelancer",
  [OccupationStatus.ENTREPRENEUR]: "Emprendedor",
  [OccupationStatus.UNEMPLOYED]: "Desempleado",
  [OccupationStatus.RETIRED]: "Jubilado",
};

export const PROFILE_WORK_MODE_LABELS: LabelRecord<WorkMode> = {
  [WorkMode.ONSITE]: "Presencial",
  [WorkMode.HYBRID]: "Híbrido",
  [WorkMode.REMOTE]: "Remoto",
};

export const PROFILE_EDUCATION_LABELS: LabelRecord<EducationLevel> = {
  [EducationLevel.NONE]: "Sin estudios formales",
  [EducationLevel.HIGH_SCHOOL]: "Secundaria",
  [EducationLevel.TECHNICAL]: "Técnico",
  [EducationLevel.UNDERGRADUATE]: "Universitario",
  [EducationLevel.GRADUATE]: "Posgrado",
  [EducationLevel.PHD]: "Doctorado",
  [EducationLevel.OTHER]: "Otro",
};

export const PROFILE_ZODIAC_LABELS: LabelRecord<ZodiacSign> = {
  [ZodiacSign.ARIES]: "Aries",
  [ZodiacSign.TAURUS]: "Tauro",
  [ZodiacSign.GEMINI]: "Géminis",
  [ZodiacSign.CANCER]: "Cáncer",
  [ZodiacSign.LEO]: "Leo",
  [ZodiacSign.VIRGO]: "Virgo",
  [ZodiacSign.LIBRA]: "Libra",
  [ZodiacSign.SCORPIO]: "Escorpio",
  [ZodiacSign.SAGITTARIUS]: "Sagitario",
  [ZodiacSign.CAPRICORN]: "Capricornio",
  [ZodiacSign.AQUARIUS]: "Acuario",
  [ZodiacSign.PISCES]: "Piscis",
  [ZodiacSign.NONE]: "Sin signo",
};

export function labelFromRecord<T extends string>(
  record: Record<T, string>,
  value: string | null | undefined,
  fallback: string | null = null,
) {
  if (value == null || value === "") {
    return fallback ?? "—";
  }
  return record[value as T] ?? value;
}
