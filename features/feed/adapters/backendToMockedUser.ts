import type {
  BackendFeedItem,
  BackendLocation,
  BackendLocationEntity,
  BackendUser,
  BackendUserFilters,
  BackendUserProfile,
} from "./feedAdapter";
import type { MockedBackendUser } from "../mocks/incomingProfile";
import { resolveProfilePhoto } from "../utils/avatar";

const FALLBACK_BIRTHDATE = "";
const FALLBACK_DISPLAY_NAME = "";
const FALLBACK_LOCATION_NAME = "";

function ensureLocationEntity(
  entity: BackendLocationEntity | null | undefined,
  fallbackId: string,
  fallbackName: string,
): BackendLocationEntity {
  const name = entity?.name?.trim();
  const id = typeof entity?.id === "string" && entity.id.trim().length > 0 ? entity.id : undefined;
  return {
    id: id ?? fallbackId,
    name: name && name.length > 0 ? name : fallbackName,
  };
}

type CompleteLocation = {
  neighborhood: BackendLocationEntity;
  city: BackendLocationEntity;
  department: BackendLocationEntity;
};

function ensureCompleteLocation(
  location?: BackendLocation | null,
  label = FALLBACK_LOCATION_NAME,
): CompleteLocation {
  return {
    neighborhood: ensureLocationEntity(
      location?.neighborhood ?? null,
      "unknown-neighborhood",
      label,
    ),
    city: ensureLocationEntity(location?.city ?? null, "unknown-city", label),
    department: ensureLocationEntity(location?.department ?? null, "unknown-department", label),
  };
}

function ensureProfile(userId: string, profile?: BackendUserProfile | null): BackendUserProfile {
  return {
    id: profile?.id ?? `profile-${userId}`,
    userId: profile?.userId ?? userId,
    bio: profile?.bio ?? null,
    currency: profile?.currency ?? null,
    occupation: profile?.occupation ?? null,
    education: profile?.education ?? null,
    tidiness: profile?.tidiness ?? null,
    schedule: profile?.schedule ?? null,
    guestsFreq: profile?.guestsFreq ?? null,
    musicUsage: profile?.musicUsage ?? null,
    quietHoursStart: profile?.quietHoursStart ?? null,
    quietHoursEnd: profile?.quietHoursEnd ?? null,
    smokesCigarettes: profile?.smokesCigarettes ?? null,
    smokesWeed: profile?.smokesWeed ?? null,
    alcohol: profile?.alcohol ?? null,
    petsOwned: profile?.petsOwned ?? null,
    petsOk: profile?.petsOk ?? null,
    cooking: profile?.cooking ?? null,
    diet: profile?.diet ?? null,
    sharePolicy: profile?.sharePolicy ?? null,
    languages: profile?.languages ?? null,
    interests: profile?.interests ?? null,
    zodiacSign: profile?.zodiacSign ?? null,
    hasPhoto: profile?.hasPhoto ?? null,
    notificationsEnabled: profile?.notificationsEnabled ?? null,
    notificationToken: profile?.notificationToken ?? null,
    lastActiveAt: profile?.lastActiveAt ?? null,
    createdAt: profile?.createdAt ?? null,
    updatedAt: profile?.updatedAt ?? null,
  };
}

function ensureFilters(
  userId: string,
  filters?: BackendUserFilters | null,
  fallbackLocation?: BackendLocation | null,
): MockedBackendUser["filters"] {
  const mainPreferredLocation = ensureCompleteLocation(
    filters?.mainPreferredLocation ?? fallbackLocation ?? null,
  );

  const preferredLocations = (filters?.preferredLocations ?? [])
    .map(loc => ensureCompleteLocation(loc, FALLBACK_LOCATION_NAME))
    .filter(
      (loc, index, array) =>
        index ===
        array.findIndex(
          other =>
            other.neighborhood.name === loc.neighborhood.name &&
            other.city.name === loc.city.name &&
            other.department.name === loc.department.name,
        ),
    );

  return {
    userId: filters?.userId ?? userId,
    mainPreferredNeighborhoodId: filters?.mainPreferredNeighborhoodId ?? null,
    genderPref: filters?.genderPref ?? null,
    minAge: filters?.minAge ?? null,
    maxAge: filters?.maxAge ?? null,
    budgetMin: filters?.budgetMin ?? null,
    budgetMax: filters?.budgetMax ?? null,
    onlyWithPhoto: filters?.onlyWithPhoto ?? null,
    mainPreferredLocation,
    preferredLocations,
  };
}

function extractNames(
  user: BackendUser | null | undefined,
  profile: BackendUserProfile,
): {
  firstName: string;
  lastName: string;
  displayName: string;
} {
  const rawFirst = user?.firstName?.trim();
  const rawLast = user?.lastName?.trim();
  const displayName = [rawFirst, rawLast]
    .filter(part => part && part.length > 0)
    .join(" ")
    .trim();

  if (displayName.length > 0) {
    return {
      firstName: rawFirst ?? displayName,
      lastName: rawLast ?? "",
      displayName,
    };
  }

  const fallbackFromBio = profile.bio?.trim() ?? "";
  if (fallbackFromBio.length > 0) {
    const parts = fallbackFromBio.split(/[\s,]+/).filter(Boolean);
    const first = parts[0] ?? FALLBACK_DISPLAY_NAME;
    const rest = parts.slice(1).join(" ");
    return {
      firstName: first,
      lastName: rest,
      displayName: fallbackFromBio,
    };
  }

  return {
    firstName: FALLBACK_DISPLAY_NAME,
    lastName: "",
    displayName: FALLBACK_DISPLAY_NAME,
  };
}

function ensurePhoto(
  url: string | null | undefined,
  userId: string,
  firstName: string,
  lastName: string,
  displayName: string,
): string {
  return resolveProfilePhoto({
    photoUrl: url ?? undefined,
    userId,
    firstName,
    lastName,
    displayName,
  });
}

function ensureSecondaryPhotos(urls: string[] | null | undefined): string[] {
  if (!Array.isArray(urls)) {
    return [];
  }
  return urls.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
}

export function mapBackendItemToMockedUser(item: BackendFeedItem): MockedBackendUser {
  const user: BackendUser | null | undefined = item.user;
  const profile = ensureProfile(item.userId, user?.profile ?? null);
  const filters = ensureFilters(item.userId, user?.filters ?? null, user?.location ?? null);
  const location = ensureCompleteLocation(user?.location ?? null);
  const names = extractNames(user, profile);

  const birthDate = user?.birthDate ?? FALLBACK_BIRTHDATE;

  return {
    ...(user ?? {
      preferences: null,
      filters: filters as BackendUserFilters,
      profile: profile as BackendUserProfile,
      birthDate: FALLBACK_BIRTHDATE,
      gender: null,
      desirabilityRating: null,
      preferredNeighborhoodIds: null,
      photosCount: null,
      profileCompletionRate: null,
      lastActiveDays: null,
    }),
    userId: item.userId,
    preferences: user?.preferences ?? null,
    filters,
    profile,
    location,
    birthDate,
    firstName: names.firstName,
    lastName: names.lastName,
    displayName: names.displayName,
    photoUrl: ensurePhoto(
      user?.photoUrl ?? null,
      item.userId,
      names.firstName,
      names.lastName,
      names.displayName,
    ),
    secondaryPhotoUrls: ensureSecondaryPhotos(user?.secondaryPhotoUrls ?? null),
    desirabilityRating: user?.desirabilityRating ?? null,
    preferredNeighborhoodIds: user?.preferredNeighborhoodIds ?? null,
    photosCount: user?.photosCount ?? null,
    profileCompletionRate: user?.profileCompletionRate ?? null,
    lastActiveDays: user?.lastActiveDays ?? null,
  } as MockedBackendUser;
}
