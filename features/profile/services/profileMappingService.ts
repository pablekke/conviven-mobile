import {
  TidinessMin,
  SchedulePreference,
  GuestsFrequency,
  SmokingStatus,
  PetType,
} from "../enums/searchPreferences.enums";
import { UserProfileData } from "../interfaces";
import { UserProfile } from "../../../types/user";

/**
 * Servicio para mapear datos del perfil del usuario a formato de formulario
 */
class ProfileMappingService {
  /**
   * Mapea el estado de fumador desde la API al formato del formulario
   */
  private mapSmokingStatus(smokesCigarettes?: string): string {
    if (!smokesCigarettes) return "";

    const normalized = smokesCigarettes.toUpperCase();

    if (normalized === SmokingStatus.NO) return "no";
    if (normalized === "YES" || normalized === SmokingStatus.REGULAR) return "yes";
    if (normalized === SmokingStatus.SOCIALLY) return "social";
    return "";
  }

  /**
   * Mapea las mascotas desde la API al formato del formulario
   */
  private mapPets(petsOwned?: string[]): string {
    if (!petsOwned || petsOwned.length === 0) return "none";

    const hasDog = petsOwned.includes(PetType.DOG) || petsOwned.includes("dog");
    const hasCat = petsOwned.includes(PetType.CAT) || petsOwned.includes("cat");

    if (hasDog) return "dog";
    if (hasCat) return "cat";
    return "other";
  }

  /**
   * Mapea el nivel de orden desde la API al formato del formulario
   * API: NEAT, AVERAGE, CHILL -> UI: very_tidy, average, messy
   */
  private mapTidiness(tidiness?: string): string {
    if (tidiness === TidinessMin.NEAT) return "very_tidy";
    if (tidiness === TidinessMin.AVERAGE) return "average";
    if (tidiness === TidinessMin.CHILL) return "messy";
    return "";
  }

  /**
   * Mapea la vida social basada en frecuencia de invitados
   * API: WEEKLY+, SOMETIMES, RARELY -> UI: often, sometimes, rarely
   */
  private mapSocialLife(guestsFreq?: string): string {
    if (guestsFreq === GuestsFrequency.WEEKLY_PLUS) return "often";
    if (guestsFreq === GuestsFrequency.SOMETIMES) return "sometimes";
    if (guestsFreq === GuestsFrequency.RARELY) return "rarely";
    return "";
  }

  /**
   * Mapea el horario de trabajo desde la API al formato del formulario
   * API: EARLY_BIRD, MIXED, NIGHT_OWL, ANY -> UI: morning, mixed, evening
   */
  private mapWorkSchedule(schedule?: string): string {
    if (!schedule) return "";

    const normalized = schedule.toUpperCase();

    if (normalized === SchedulePreference.EARLY_BIRD) return "morning";
    if (normalized === SchedulePreference.MIXED) return "mixed";
    if (normalized === SchedulePreference.NIGHT_OWL) return "evening";
    if (normalized === "ANY") return "mixed";
    return "";
  }

  /**
   * Mapea el horario de sueño basado en el schedule preference
   * API: EARLY_BIRD, MIXED, NIGHT_OWL, ANY -> UI: early_bird, flexible, night_owl
   */
  private mapSleepTime(schedule?: string): string {
    if (!schedule) return "";

    const normalized = schedule.toUpperCase();

    if (normalized === SchedulePreference.EARLY_BIRD) return "early_bird";
    if (normalized === SchedulePreference.NIGHT_OWL) return "night_owl";
    if (normalized === SchedulePreference.MIXED || normalized === "ANY") {
      return "flexible";
    }
    return "";
  }

  /**
   * Mapea el estado de alcohol desde la API
   */
  private mapAlcohol(alcohol?: string): string {
    if (!alcohol) return "";
    const alcoholUpper = alcohol.toUpperCase();
    if (alcoholUpper === "NO") return "no";
    if (alcoholUpper === "YES") return "regularly";
    if (alcoholUpper === "SOCIALLY") return "socially";
    return "";
  }

  /**
   * Mapea la política de mascotas
   */
  private mapPetsPolicy(petsOk?: string): string {
    if (!petsOk) return "";
    const petsOkUpper = petsOk.toUpperCase();
    if (
      petsOkUpper === "CATS_DOGS_OK" ||
      petsOkUpper === "CATS_OK" ||
      petsOkUpper === "DOGS_OK" ||
      petsOkUpper === "ANY_PETS"
    ) {
      return "cats_dogs_ok";
    }
    if (petsOkUpper === "NO_PETS") return "no_pets";
    return "depends";
  }

  /**
   * Mapea los datos completos del perfil del usuario
   */
  mapUserProfileToFormData(userData: any): UserProfileData {
    const profile: UserProfile | undefined = userData?.profile;

    return {
      bio: profile?.bio ?? "",
      smokingStatus: this.mapSmokingStatus(profile?.smokesCigarettes),
      marijuanaStatus: this.mapSmokingStatus(profile?.smokesWeed),
      alcoholStatus: this.mapAlcohol(profile?.alcohol),
      hasPets: this.mapPets(profile?.petsOwned),
      acceptsPets: this.mapPetsPolicy(profile?.petsOk),
      tidinessLevel: this.mapTidiness(profile?.tidiness),
      socialLife: this.mapSocialLife(profile?.guestsFreq),
      workSchedule: this.mapWorkSchedule(profile?.schedule),
      sleepTime: this.mapSleepTime(profile?.schedule),
    };
  }
}

export default new ProfileMappingService();
