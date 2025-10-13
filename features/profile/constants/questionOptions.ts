import {
  SmokesCigarettes,
  SmokesWeed,
  Alcohol,
  PetType,
  PetsOk,
  Tidiness,
  Schedule,
  GuestsFreq,
  MusicUsage,
  GenderPreference,
} from "../enums";

export const QUESTION_OPTIONS = {
  smoking: [
    { value: SmokesCigarettes.NO, label: "No fumo" },
    { value: SmokesCigarettes.REGULAR, label: "Fumo" },
    { value: SmokesCigarettes.SOCIALLY, label: "Fumador social" },
  ],
  marijuana: [
    { value: SmokesWeed.NO, label: "No fumo" },
    { value: SmokesWeed.REGULAR, label: "Fumo" },
    { value: SmokesWeed.SOCIALLY, label: "Fumador social" },
  ],
  alcohol: [
    { value: Alcohol.NO, label: "No tomo" },
    { value: Alcohol.SOCIALLY, label: "Solo en eventos" },
    { value: Alcohol.REGULAR, label: "Regularmente" },
  ],
  pets: [
    { value: PetType.DOG, label: "Perro" },
    { value: PetType.CAT, label: "Gato" },
    { value: PetType.OTHER, label: "Otro" },
    { value: "none", label: "No tengo" },
  ],
  acceptPets: [
    { value: PetsOk.CATS_DOGS_OK, label: "Sí, me gustan" },
    { value: PetsOk.CATS_OK, label: "Solo gatos" },
    { value: PetsOk.DOGS_OK, label: "Solo perros" },
    { value: PetsOk.NO, label: "No acepto" },
  ],
  tidiness: [
    { value: Tidiness.NEAT, label: "Muy ordenado" },
    { value: Tidiness.AVERAGE, label: "Algo ordenado" },
    { value: Tidiness.CHILL, label: "Poco ordenado" },
  ],
  visitors: [
    { value: GuestsFreq.WEEKLY_PLUS, label: "Recibo muchas visitas" },
    { value: GuestsFreq.SOMETIMES, label: "Recibo visitas a veces" },
    { value: GuestsFreq.RARELY, label: "Raramente recibo visitas" },
  ],
  sleepRoutine: [
    { value: Schedule.EARLY_BIRD, label: "Madrugador" },
    { value: Schedule.NIGHT_OWL, label: "Nocturno" },
    { value: Schedule.MIXED, label: "Flexible" },
  ],
  workRoutine: [
    { value: "morning", label: "Mañana" },
    { value: "afternoon", label: "Tarde" },
    { value: "evening", label: "Noche" },
    { value: "mixed", label: "Mixto" },
  ],
  noCigarettes: [
    { value: "false", label: "Sí acepto" },
    { value: "true", label: "No acepto" },
  ],
  noWeed: [
    { value: "false", label: "Sí acepto" },
    { value: "true", label: "No acepto" },
  ],
  petsPreference: [
    { value: "noPets", label: "No mascotas" },
    { value: "petsRequired", label: "Con mascotas" },
    { value: "none", label: "Sin preferencia" },
  ],
  tidinessMin: [
    { value: Tidiness.CHILL, label: "Relajado" },
    { value: Tidiness.AVERAGE, label: "Promedio" },
    { value: Tidiness.NEAT, label: "Muy ordenado" },
  ],
  schedulePref: [
    { value: Schedule.EARLY_BIRD, label: "Madrugador (6am-10pm)" },
    { value: Schedule.MIXED, label: "Mixto (8am-12am)" },
    { value: Schedule.NIGHT_OWL, label: "Noctámbulo (12pm-3am)" },
  ],
  guestsMax: [
    { value: GuestsFreq.RARELY, label: "Rara vez" },
    { value: GuestsFreq.SOMETIMES, label: "A veces" },
    { value: GuestsFreq.WEEKLY_PLUS, label: "Semanalmente o más" },
  ],
  musicMax: [
    { value: MusicUsage.HEADPHONES, label: "Solo con audífonos" },
    { value: MusicUsage.SPEAKER_DAY, label: "Bocinas durante el día" },
    { value: MusicUsage.SPEAKER_FLEX, label: "Bocinas flexible" },
  ],
  genderPref: [
    { value: GenderPreference.ANY, label: "Cualquier género" },
    { value: GenderPreference.MALE, label: "Hombres" },
    { value: GenderPreference.FEMALE, label: "Mujeres" },
    { value: GenderPreference.NON_BINARY, label: "No binario" },
    { value: GenderPreference.UNSPECIFIED, label: "Sin especificar" },
    { value: GenderPreference.MOSTLY_MEN, label: "Mayormente hombres" },
    { value: GenderPreference.MOSTLY_WOMEN, label: "Mayormente mujeres" },
  ],
  onlyWithPhoto: [
    { value: "true", label: "Solo con foto" },
    { value: "false", label: "Con o sin foto" },
  ],
};
