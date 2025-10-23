// FeedAdapter.ts
import type { Roomie } from "../types";
import {
  CleaningFrequency,
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
  ZodiacSign,
} from "../../../core/enums";

/** ===== Tipos de payload que viene del backend (según tu ejemplo) ===== */
interface BackendUserProfile {
  id: string;
  userId: string;
  bio: string | null;
  currency: string | null;
  tidiness: Tidiness | null;
  schedule: Schedule | null;
  guestsFreq: GuestsFreq | null;
  musicUsage: MusicUsage | null;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  smokesCigarettes: SmokesCigarettes | null;
  smokesWeed: SmokesWeed | null;
  alcohol: Alcohol | null;
  petsOwned: string[] | null;
  petsOk: PetsOk | null;
  cooking: Cooking | null;
  diet: Diet | null;
  sharePolicy: SharePolicy | null;
  languages: string[] | null;
  interests: string[] | null;
  zodiacSign: ZodiacSign | null;
  hasPhoto: boolean | null;
  notificationsEnabled: boolean | null;
  notificationToken: string | null;
  lastActiveAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface BackendUserFilters {
  userId: string;
  mainPreferredNeighborhoodId: string | null;
  genderPref: ("MALE" | "FEMALE")[] | [];
  minAge: number | null;
  maxAge: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  onlyWithPhoto: boolean | null;
}

interface BackendUser {
  profile: BackendUserProfile | null;
  filters: BackendUserFilters | null;
  prefs: unknown | null; // no lo necesitamos aún
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | string | null;
  desirabilityRating: number | null;
  preferredNeighborhoodIds: string[] | null;
  photosCount: number | null;
  profileCompletionRate: number | null;
  lastActiveDays: number | null;
}

interface BackendFeedItem {
  userId: string;
  user: BackendUser | null;
  score: number; // 0..1
}

interface BackendFeedResponse {
  items: BackendFeedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** ===== Adapter ===== */
export class FeedAdapter {
  /** Item → Roomie */
  static mapBackendItemToRoomie(item: BackendFeedItem): Roomie {
    const user = item.user ?? null;
    const profile = user?.profile ?? null;

    const age = FeedAdapter.calculateAge(user?.birthDate ?? null) ?? 0;
    const photo = FeedAdapter.getUserPhoto(user, item.userId) ?? "";
    const lifestyle = FeedAdapter.getUserLifestyle(profile);
    const preferences = FeedAdapter.getUserPreferences(user);

    return {
      id: item.userId,
      name: FeedAdapter.buildDisplayName(profile) ?? "Usuario",
      age,
      profession: "No especificado", // no viene en el payload
      bio: (profile?.bio ?? "").trim(),
      interests: profile?.interests ?? [],
      matchScore: FeedAdapter.toPercent(item.score),
      photo,
      // Campos "extendidos" que comentaste:
      location: undefined, // no viene
      university: undefined, // no viene
      department: undefined, // no viene
      neighborhood: FeedAdapter.getNeighborhood(user) ?? undefined,
      budget: FeedAdapter.getUserBudget(user),
      moveInDate: undefined, // no viene
      distanceMeters: FeedAdapter.getLastActiveDays(user),
      lifestyle,
      preferences,
    };
  }

  /** Lista de items → Roomie[] */
  static mapBackendItemsToRoomies(items: BackendFeedItem[]): Roomie[] {
    return items.map(FeedAdapter.mapBackendItemToRoomie);
  }

  /** Respuesta completa → shape del front */
  static mapBackendResponseToFeedResponse(backend: BackendFeedResponse) {
    const items = FeedAdapter.mapBackendItemsToRoomies(backend.items ?? []);
    return {
      items,
      total: backend.total ?? items.length,
      page: backend.page ?? 1,
      limit: backend.limit ?? items.length,
      totalPages: backend.totalPages ?? 1,
      hasNext: Boolean(backend.hasNext),
      hasPrev: Boolean(backend.hasPrev),
    };
  }

  /** ===== Helpers privados ===== */

  /** Nombre visible: intenta extraer de “Hola, soy X”, si no, usa primeras 2 palabras del bio */
  private static buildDisplayName(profile: BackendUserProfile | null): string | undefined {
    const bio = profile?.bio?.trim();
    if (!bio) return undefined;

    // Patrón clásico “Hola, soy Antonella”
    const hello = bio.match(/^\s*hola,\s*soy\s+([^,.!]+)/i);
    if (hello?.[1]) return hello[1].trim();

    // Si no, primeras dos palabras del bio
    const words = bio.split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
    return words || undefined;
  }

  /** Edad desde ISO date (si es inválida retorna undefined) */
  private static calculateAge(birthISO: string | null): number | undefined {
    if (!birthISO) return undefined;
    const birth = new Date(birthISO);
    if (isNaN(birth.getTime())) return undefined;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : undefined;
  }

  /** Barrio preferido (primer id si existe) */
  private static getNeighborhood(user: BackendUser | null): string | undefined {
    const ids = user?.preferredNeighborhoodIds ?? [];
    return ids.length ? ids[0] : undefined;
  }

  /** Score 0..1 → 0..100 (redondeado) */
  private static toPercent(score: number | null): number {
    const s = typeof score === "number" && isFinite(score) ? score : 0;
    const clamped = Math.max(0, Math.min(1, s));
    return Math.round(clamped * 100);
  }

  /** Foto: si el usuario tiene foto o count>0 → usar CDN, si no fallback */
  private static getUserPhoto(user: BackendUser | null, userId: string): string | undefined {
    const profileHas = Boolean(user?.profile?.hasPhoto);
    const countHas = (user?.photosCount ?? 0) > 0;
    if (profileHas || countHas) {
      // TODO: reemplazar por tu endpoint real de media (ej: `${ASSETS}/users/${userId}/avatar.jpg`)
      return `https://i.pravatar.cc/600?u=${encodeURIComponent(userId)}`;
    }
    // Si no tiene foto, usar un placeholder genérico
    return `https://i.pravatar.cc/600?u=${encodeURIComponent(userId)}`;
  }

  /** Días desde la última actividad (usando lastActiveDays del backend) */
  private static getLastActiveDays(user: BackendUser | null): number {
    return user?.lastActiveDays ?? 0;
  }

  private static getUserBudget(user: BackendUser | null) {
    return {
      min: user?.filters?.budgetMin ?? null,
      max: user?.filters?.budgetMax ?? null,
    };
  }

  private static getUserLifestyle(profile: BackendUserProfile | null) {
    const cleaning = FeedAdapter.mapTidinessToCleaningFrequency(profile?.tidiness ?? null);
    return {
      smoking: (profile?.smokesCigarettes ?? SmokesCigarettes.NO) !== SmokesCigarettes.NO,
      pets: (profile?.petsOk ?? PetsOk.NO) !== PetsOk.NO,
      guests: (profile?.guestsFreq ?? GuestsFreq.RARELY) !== GuestsFreq.RARELY,
      cleaning: cleaning ?? CleaningFrequency.WEEKLY,
    };
  }

  private static mapTidinessToCleaningFrequency(
    tidiness: BackendUserProfile["tidiness"],
  ): CleaningFrequency | undefined {
    switch (tidiness) {
      case Tidiness.NEAT:
        return CleaningFrequency.DAILY;
      case Tidiness.AVERAGE:
        return CleaningFrequency.WEEKLY;
      case Tidiness.CHILL:
        return CleaningFrequency.MONTHLY;
      default:
        return undefined;
    }
  }

  private static getUserPreferences(user: BackendUser | null) {
    const gender = FeedAdapter.mapGenderPref(user?.filters?.genderPref ?? []);
    return {
      gender,
      ageRange: {
        min: user?.filters?.minAge ?? 18,
        max: user?.filters?.maxAge ?? 100,
      },
      // Para los “chips” del card, el diseño muestra intereses del perfil:
      lifestyle: user?.profile?.interests ?? [],
    };
  }

  private static mapGenderPref(genderPref: ("MALE" | "FEMALE")[]): GenderPreference {
    if (!genderPref || genderPref.length === 0) return GenderPreference.ANY;
    const hasM = genderPref.includes("MALE");
    const hasF = genderPref.includes("FEMALE");
    if (hasM && hasF) return GenderPreference.ANY;
    if (hasM) return GenderPreference.MALE;
    if (hasF) return GenderPreference.FEMALE;
    return GenderPreference.ANY;
  }
}
