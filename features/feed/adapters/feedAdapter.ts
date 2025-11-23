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

const DEFAULT_PAGE_SIZE = 20;

/** ===== Tipos de payload que viene del backend (según tu ejemplo) ===== */
export interface BackendUserProfile {
  id: string;
  userId: string;
  bio: string | null;
  currency: string | null;
  occupation?: string | null;
  education?: string | null;
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

export interface BackendLocationEntity {
  id: string;
  name: string;
}

export interface BackendLocation {
  neighborhood?: BackendLocationEntity | null;
  city?: BackendLocationEntity | null;
  department?: BackendLocationEntity | null;
}

export interface BackendUserFilters {
  userId: string;
  mainPreferredNeighborhoodId: string | null;
  genderPref: string[] | null;
  minAge: number | null;
  maxAge: number | null;
  budgetMin: number | string | null;
  budgetMax: number | string | null;
  onlyWithPhoto: boolean | null;
  mainPreferredLocation?: BackendLocation | null;
  preferredLocations?: BackendLocation[] | null;
}

export interface BackendUserPreferences {
  userId: string;
  noCigarettes: boolean | null;
  noWeed: boolean | null;
  noPets: boolean | null;
  petsRequired: boolean | null;
  requireQuietHoursOverlap: boolean | null;
  tidinessMin: Tidiness | null;
  schedulePref: Schedule | null;
  guestsMax: GuestsFreq | null;
  musicMax: MusicUsage | null;
  languagesPref: string[] | null;
  interestsPref: string[] | null;
  zodiacPref: string[] | null;
  lastActiveWithinDays?: number | null;
}

export interface BackendUser {
  profile: BackendUserProfile | null;
  filters: BackendUserFilters | null;
  preferences: BackendUserPreferences | null;
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | string | null;
  desirabilityRating: number | null;
  preferredNeighborhoodIds: string[] | null;
  photosCount: number | null;
  profileCompletionRate: number | null;
  lastActiveDays: number | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  secondaryPhotoUrls?: string[] | null;
  location?: BackendLocation | null;
  lastLoginAt?: string | null;
}

export interface BackendFeedItem {
  userId: string;
  user: BackendUser | null;
  score: number; // 0..1
}

export interface BackendFeedResponse {
  items: BackendFeedItem[];
  total: number | string;
  page: number | string;
  limit: number | string;
  totalPages: number | string;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/** ===== Adapter ===== */
export class FeedAdapter {
  /** Item → Roomie */
  static mapBackendItemToRoomie(item: BackendFeedItem): Roomie {
    const user = item.user ?? null;
    const profile = user?.profile ?? null;

    const age = FeedAdapter.calculateAge(user?.birthDate ?? null) ?? 0;
    const gallery = FeedAdapter.getPhotoGallery(user, item.userId);
    const lifestyle = FeedAdapter.getUserLifestyle(profile);
    const preferences = FeedAdapter.getUserPreferences(user);
    const location = FeedAdapter.getLocationLabels(user);
    const budget = FeedAdapter.getUserBudget(user);
    const interests = FeedAdapter.getInterests(user);
    const languages = FeedAdapter.uniqueStrings([
      ...(profile?.languages ?? []),
      ...(user?.preferences?.languagesPref ?? []),
    ]);

    return {
      id: item.userId,
      name: FeedAdapter.buildDisplayName(user, profile) ?? "Usuario",
      age,
      profession: profile?.occupation ?? "No especificado",
      bio: (profile?.bio ?? "").trim(),
      interests,
      matchScore: FeedAdapter.toPercent(item.score),
      photo: gallery[0] ?? "",
      photoGallery: gallery,
      location: location.full,
      department: location.department,
      neighborhood: location.neighborhood,
      city: location.city,
      budget,
      budgetCurrency: profile?.currency ?? undefined,
      moveInDate: undefined,
      lastActiveDays: FeedAdapter.getLastActiveDays(user),
      lifestyle,
      preferences,
      languages,
      quietHours: {
        start: profile?.quietHoursStart ?? undefined,
        end: profile?.quietHoursEnd ?? undefined,
      },
      zodiacSign: profile?.zodiacSign ?? undefined,
      profileCompletionRate: user?.profileCompletionRate ?? undefined,
      photosCount: typeof user?.photosCount === "number" ? (user?.photosCount ?? 0) : undefined,
    };
  }

  /** Lista de items → Roomie[] */
  static mapBackendItemsToRoomies(items: BackendFeedItem[]): Roomie[] {
    return items.map(FeedAdapter.mapBackendItemToRoomie);
  }

  /** Respuesta completa → shape del front */
  static mapBackendResponseToFeedResponse(backend: BackendFeedResponse) {
    const items = FeedAdapter.mapBackendItemsToRoomies(backend.items ?? []);
    const total = FeedAdapter.parseNumber(backend.total, items.length);
    const limit = FeedAdapter.parseNumber(backend.limit, DEFAULT_PAGE_SIZE);
    const safeLimit = limit > 0 ? limit : DEFAULT_PAGE_SIZE;
    const page = FeedAdapter.parseNumber(backend.page, 1);
    const computedTotalPages = Math.max(1, Math.ceil(total / safeLimit));
    const backendTotalPages = FeedAdapter.parseNumber(backend.totalPages, computedTotalPages);
    const totalPages = Math.max(backendTotalPages, computedTotalPages);
    const hasNext = typeof backend.hasNext === "boolean" ? backend.hasNext : page < totalPages;
    const hasPrev = typeof backend.hasPrev === "boolean" ? backend.hasPrev : page > 1;

    return {
      items,
      total,
      page,
      limit: safeLimit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /** ===== Helpers privados ===== */

  /** Nombre visible: intenta extraer de “Hola, soy X”, si no, usa primeras 2 palabras del bio */
  private static buildDisplayName(
    user: BackendUser | null,
    profile: BackendUserProfile | null,
  ): string | undefined {
    const fullName = [user?.firstName, user?.lastName]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(" ");
    if (fullName) {
      return fullName;
    }

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

  /** Score 0..1 → 0..100 (redondeado) */
  private static toPercent(score: number | null): number {
    const s = typeof score === "number" && isFinite(score) ? score : 0;
    const clamped = Math.max(0, Math.min(1, s));
    return Math.round(clamped * 100);
  }

  private static getPhotoGallery(user: BackendUser | null, userId: string): string[] {
    const urls = [user?.photoUrl, ...(user?.secondaryPhotoUrls ?? [])].filter(
      (url): url is string => typeof url === "string" && url.length > 0,
    );
    if (urls.length > 0) {
      return urls;
    }
    const fallback = `https://i.pravatar.cc/600?u=${encodeURIComponent(userId)}`;
    return [fallback];
  }

  /** Días desde la última actividad */
  private static getLastActiveDays(user: BackendUser | null): number | undefined {
    if (typeof user?.lastActiveDays === "number") {
      return user.lastActiveDays;
    }

    const lastActiveISO = user?.profile?.lastActiveAt ?? user?.lastLoginAt ?? null;
    if (!lastActiveISO) {
      return undefined;
    }

    const lastActiveDate = new Date(lastActiveISO);
    if (Number.isNaN(lastActiveDate.getTime())) {
      return undefined;
    }

    const diffMs = Date.now() - lastActiveDate.getTime();
    if (diffMs <= 0) {
      return 0;
    }

    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private static getUserBudget(user: BackendUser | null) {
    const min = FeedAdapter.parseBudgetValue(user?.filters?.budgetMin);
    const max = FeedAdapter.parseBudgetValue(user?.filters?.budgetMax);

    if (min === null && max === null) {
      return undefined;
    }

    return {
      min,
      max,
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
    const gender = FeedAdapter.mapGenderPref(user?.filters?.genderPref);
    const minAge = FeedAdapter.parseNumber(user?.filters?.minAge, 18);
    const maxAge = FeedAdapter.parseNumber(user?.filters?.maxAge, Math.max(minAge, 100));
    const lifestyle = FeedAdapter.getInterests(user);
    return {
      gender,
      ageRange: {
        min: minAge,
        max: Math.max(minAge, maxAge),
      },
      lifestyle,
    };
  }

  private static mapGenderPref(genderPref?: string[] | null): GenderPreference {
    if (!genderPref || genderPref.length === 0) {
      return GenderPreference.ANY;
    }

    const normalized = FeedAdapter.uniqueStrings(
      genderPref.map(value => (typeof value === "string" ? value.toUpperCase() : "")),
    );

    for (const candidate of normalized) {
      if (candidate in GenderPreference) {
        return GenderPreference[candidate as keyof typeof GenderPreference];
      }
    }

    if (normalized.includes(GenderPreference.MOSTLY_MEN)) {
      return GenderPreference.MOSTLY_MEN;
    }
    if (normalized.includes(GenderPreference.MOSTLY_WOMEN)) {
      return GenderPreference.MOSTLY_WOMEN;
    }

    const hasMale = normalized.includes(GenderPreference.MALE);
    const hasFemale = normalized.includes(GenderPreference.FEMALE);
    const hasNonBinary = normalized.includes(GenderPreference.NON_BINARY);

    if (hasMale && hasFemale && hasNonBinary) {
      return GenderPreference.ANY;
    }

    if (hasMale && hasFemale) {
      return GenderPreference.ANY;
    }

    if (hasMale) {
      return GenderPreference.MALE;
    }

    if (hasFemale) {
      return GenderPreference.FEMALE;
    }

    if (hasNonBinary) {
      return GenderPreference.NON_BINARY;
    }

    return GenderPreference.ANY;
  }

  private static parseBudgetValue(value: number | string | null | undefined): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  private static parseNumber(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return fallback;
  }

  private static getLocationLabels(user: BackendUser | null) {
    const candidateLocations: (BackendLocation | null | undefined)[] = [
      user?.filters?.mainPreferredLocation,
      ...(user?.filters?.preferredLocations ?? []),
      user?.location,
    ];

    const location = candidateLocations.find(loc => {
      if (!loc) return false;
      const names = [
        loc.neighborhood?.name ?? "",
        loc.city?.name ?? "",
        loc.department?.name ?? "",
      ];
      return names.some(name => name.trim().length > 0);
    });

    const neighborhood = location?.neighborhood?.name?.trim();
    const city = location?.city?.name?.trim();
    const department = location?.department?.name?.trim();

    const parts = [neighborhood, city, department].filter(Boolean) as string[];

    return {
      full: parts.length > 0 ? parts.join(", ") : undefined,
      neighborhood: neighborhood ?? undefined,
      city: city ?? undefined,
      department: department ?? undefined,
    };
  }

  private static getInterests(user: BackendUser | null): string[] {
    const profileInterests = user?.profile?.interests ?? [];
    const preferenceInterests = user?.preferences?.interestsPref ?? [];
    return FeedAdapter.uniqueStrings([...profileInterests, ...preferenceInterests]);
  }

  private static uniqueStrings(values: (string | null | undefined)[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const value of values) {
      if (!value) continue;
      const normalized = value.trim();
      if (!normalized) continue;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    }

    return result;
  }
}
