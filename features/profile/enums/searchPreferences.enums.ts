export enum Tidiness {
  CHILL = "CHILL",
  AVERAGE = "AVERAGE",
  NEAT = "NEAT",
}

export enum Schedule {
  EARLY_BIRD = "EARLY_BIRD",
  MIXED = "MIXED",
  NIGHT_OWL = "NIGHT_OWL",
}

export enum GuestsFreq {
  RARELY = "RARELY",
  SOMETIMES = "SOMETIMES",
  WEEKLY_PLUS = "WEEKLY+",
}

export enum MusicUsage {
  HEADPHONES = "HEADPHONES",
  SPEAKER_DAY = "SPEAKER_DAY",
  SPEAKER_FLEX = "SPEAKER_FLEX",
}

export enum Cooking {
  RARE = "RARE",
  SOMETIMES = "SOMETIMES",
  OFTEN = "OFTEN",
}

export enum SharePolicy {
  STRICT = "STRICT",
  ASK_FIRST = "ASK_FIRST",
  BASIC_SHARED = "BASIC_SHARED",
}

export enum SmokesCigarettes {
  NO = "NO",
  SOCIALLY = "SOCIALLY",
  REGULAR = "REGULAR",
}

export enum SmokesWeed {
  NO = "NO",
  SOCIALLY = "SOCIALLY",
  REGULAR = "REGULAR",
}

export enum PetsOk {
  NO = "NO",
  CATS_OK = "CATS_OK",
  DOGS_OK = "DOGS_OK",
  CATS_DOGS_OK = "CATS_DOGS_OK",
}

export enum Alcohol {
  NO = "NO",
  SOCIALLY = "SOCIALLY",
  REGULAR = "REGULAR",
}

export enum Diet {
  NONE = "NONE",
  VEGETARIAN = "VEGETARIAN",
  VEGAN = "VEGAN",
  OTHER = "OTHER",
}

export enum OccupationStatus {
  STUDENT = "STUDENT",
  EMPLOYED = "EMPLOYED",
  FREELANCE = "FREELANCE",
  ENTREPRENEUR = "ENTREPRENEUR",
  UNEMPLOYED = "UNEMPLOYED",
  RETIRED = "RETIRED",
}

export enum WorkMode {
  ONSITE = "ONSITE",
  HYBRID = "HYBRID",
  REMOTE = "REMOTE",
}

export enum EducationLevel {
  NONE = "NONE",
  HIGH_SCHOOL = "HIGH_SCHOOL",
  TECHNICAL = "TECHNICAL",
  UNDERGRADUATE = "UNDERGRADUATE",
  GRADUATE = "GRADUATE",
  PHD = "PHD",
  OTHER = "OTHER",
}

export enum ZodiacSign {
  ARIES = "ARIES",
  TAURUS = "TAURUS",
  GEMINI = "GEMINI",
  CANCER = "CANCER",
  LEO = "LEO",
  VIRGO = "VIRGO",
  LIBRA = "LIBRA",
  SCORPIO = "SCORPIO",
  SAGITTARIUS = "SAGITTARIUS",
  CAPRICORN = "CAPRICORN",
  AQUARIUS = "AQUARIUS",
  PISCES = "PISCES",
  NONE = "NONE",
}

export enum GenderPreference {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  UNSPECIFIED = "UNSPECIFIED",
  MOSTLY_MEN = "MOSTLY_MEN",
  MOSTLY_WOMEN = "MOSTLY_WOMEN",
  ANY = "ANY",
}

export const TidinessMin = Tidiness;
export const SchedulePreference = Schedule;
export const GuestsFrequency = GuestsFreq;
export const SmokingStatus = SmokesCigarettes;
export const PetPolicy = PetsOk;
export const AlcoholConsumption = Alcohol;
export const CookingFrequency = Cooking;

export enum PetType {
  DOG = "DOG",
  CAT = "CAT",
  BIRD = "BIRD",
  FISH = "FISH",
  OTHER = "OTHER",
}

export enum Language {
  SPANISH = "Spanish",
  ENGLISH = "English",
  PORTUGUESE = "Portuguese",
  FRENCH = "French",
  ITALIAN = "Italian",
  GERMAN = "German",
  OTHER = "Other",
}

export enum Interest {
  GAMING = "Gaming",
  READING = "Reading",
  COOKING = "Cooking",
  SPORTS = "Sports",
  MUSIC = "Music",
  TRAVEL = "Travel",
  ART = "Art",
  TECHNOLOGY = "Technology",
  FITNESS = "Fitness",
  PHOTOGRAPHY = "Photography",
  MOVIES = "Movies",
  DANCE = "Dance",
  OTHER = "Other",
}

export const TIDINESS_LABELS: Record<Tidiness, string> = {
  [Tidiness.CHILL]: "Relajado",
  [Tidiness.AVERAGE]: "Promedio",
  [Tidiness.NEAT]: "Muy ordenado",
};

export const SCHEDULE_LABELS: Record<Schedule, string> = {
  [Schedule.EARLY_BIRD]: "Madrugador (6am-10pm)",
  [Schedule.MIXED]: "Mixto (8am-12am)",
  [Schedule.NIGHT_OWL]: "Noctámbulo (12pm-3am)",
};

export const GUESTS_LABELS: Record<GuestsFreq, string> = {
  [GuestsFreq.RARELY]: "Rara vez",
  [GuestsFreq.SOMETIMES]: "A veces",
  [GuestsFreq.WEEKLY_PLUS]: "Semanalmente o más",
};

export const MUSIC_LABELS: Record<MusicUsage, string> = {
  [MusicUsage.HEADPHONES]: "Solo con audífonos",
  [MusicUsage.SPEAKER_DAY]: "Parlantes durante el día",
  [MusicUsage.SPEAKER_FLEX]: "Parlantes flexible",
};

export const SMOKING_LABELS: Record<SmokesCigarettes, string> = {
  [SmokesCigarettes.NO]: "No fumo",
  [SmokesCigarettes.SOCIALLY]: "Fumador social",
  [SmokesCigarettes.REGULAR]: "Fumo regularmente",
};

export const WEED_LABELS: Record<SmokesWeed, string> = {
  [SmokesWeed.NO]: "No fumo",
  [SmokesWeed.SOCIALLY]: "Fumador social",
  [SmokesWeed.REGULAR]: "Fumo regularmente",
};

export const PETS_OK_LABELS: Record<PetsOk, string> = {
  [PetsOk.NO]: "No acepto mascotas",
  [PetsOk.CATS_OK]: "Solo acepto gatos",
  [PetsOk.DOGS_OK]: "Solo acepto perros",
  [PetsOk.CATS_DOGS_OK]: "Acepto gatos y perros",
};

export const ALCOHOL_LABELS: Record<Alcohol, string> = {
  [Alcohol.NO]: "No tomo",
  [Alcohol.SOCIALLY]: "Solo en eventos",
  [Alcohol.REGULAR]: "Regularmente",
};

export const COOKING_LABELS: Record<Cooking, string> = {
  [Cooking.RARE]: "Rara vez",
  [Cooking.SOMETIMES]: "A veces",
  [Cooking.OFTEN]: "Frecuentemente",
};

export const SHARE_LABELS: Record<SharePolicy, string> = {
  [SharePolicy.STRICT]: "No comparto",
  [SharePolicy.ASK_FIRST]: "Preguntar primero",
  [SharePolicy.BASIC_SHARED]: "Comparto básicos",
};

export const DIET_LABELS: Record<Diet, string> = {
  [Diet.NONE]: "Sin dieta especial",
  [Diet.VEGETARIAN]: "Vegetariano",
  [Diet.VEGAN]: "Vegano",
  [Diet.OTHER]: "Otra dieta",
};

export const OCCUPATION_LABELS: Record<OccupationStatus, string> = {
  [OccupationStatus.STUDENT]: "Estudiante",
  [OccupationStatus.EMPLOYED]: "Empleado",
  [OccupationStatus.FREELANCE]: "Freelancer",
  [OccupationStatus.ENTREPRENEUR]: "Emprendedor",
  [OccupationStatus.UNEMPLOYED]: "Desempleado",
  [OccupationStatus.RETIRED]: "Jubilado",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  [WorkMode.ONSITE]: "Presencial",
  [WorkMode.HYBRID]: "Híbrido",
  [WorkMode.REMOTE]: "Remoto",
};

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  [EducationLevel.NONE]: "Sin educación formal",
  [EducationLevel.HIGH_SCHOOL]: "Bachillerato",
  [EducationLevel.TECHNICAL]: "Técnico",
  [EducationLevel.UNDERGRADUATE]: "Universitario",
  [EducationLevel.GRADUATE]: "Posgrado",
  [EducationLevel.PHD]: "Doctorado",
  [EducationLevel.OTHER]: "Otro",
};

export const GENDER_LABELS: Record<GenderPreference, string> = {
  [GenderPreference.MALE]: "Hombres",
  [GenderPreference.FEMALE]: "Mujeres",
  [GenderPreference.NON_BINARY]: "No binario",
  [GenderPreference.UNSPECIFIED]: "Sin especificar",
  [GenderPreference.MOSTLY_MEN]: "Mayormente hombres",
  [GenderPreference.MOSTLY_WOMEN]: "Mayormente mujeres",
  [GenderPreference.ANY]: "Cualquier género",
};

export const ZODIAC_LABELS: Record<ZodiacSign, string> = {
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
  [ZodiacSign.NONE]: "No creo en signos",
};
