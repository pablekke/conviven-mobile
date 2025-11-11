import { calcAge, toInt } from "../utils/formatters";
import {
  PROFILE_DIET_LABELS,
  PROFILE_OCCUPATION_LABELS,
  PROFILE_SCHEDULE_LABELS,
  PROFILE_TIDINESS_LABELS,
  labelFromRecord,
} from "../../profile/i18n/profileLabels";

type NamedLocation = {
  department: { name: string };
  city: { name: string };
  neighborhood: { name: string };
};

export type ProfileCardSource = {
  firstName: string;
  lastName: string;
  displayName?: string | null;
  birthDate: string;
  photoUrl?: string | null;
  secondaryPhotoUrls?: readonly (string | null)[] | null;
  profile: {
    tidiness?: string | null;
    schedule?: string | null;
    diet?: string | null;
    occupation?: string | null;
  };
  filters: {
    budgetMin?: unknown;
    budgetMax?: unknown;
    mainPreferredLocation: NamedLocation;
    preferredLocations: readonly NamedLocation[];
  };
  location?: NamedLocation;
};

const FALLBACK_PRIMARY_PHOTO =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop";
const FALLBACK_SECONDARY_PHOTO =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1480&auto=format&fit=crop";

function sanitizePhotoUrl(url: unknown, fallback: string): string {
  if (!url) return fallback;
  const parsed = String(url);
  if (parsed.trim() === "" || parsed.includes("PONELE")) return fallback;
  return parsed;
}

function formatLocationString(location: NamedLocation) {
  return `${location.department.name} · ${location.city.name} · ${location.neighborhood.name}`;
}

export type ProfileCardData = {
  age: number;
  basicInfo: readonly string[];
  locationStrings: string[];
  longestLocation: string;
  budgetLabel: string;
  budgetFull: string;
  headline: string;
  galleryPhotos: string[];
  mainPhoto: string;
  mainLocation: string;
};

export function createProfileCardData(profile: ProfileCardSource): ProfileCardData {
  const age = calcAge(profile.birthDate);

  const basicInfo: readonly string[] = [
    labelFromRecord(PROFILE_TIDINESS_LABELS, profile.profile.tidiness),
    labelFromRecord(PROFILE_SCHEDULE_LABELS, profile.profile.schedule),
    labelFromRecord(PROFILE_DIET_LABELS, profile.profile.diet),
    labelFromRecord(PROFILE_OCCUPATION_LABELS, profile.profile.occupation),
  ];

  const locationStrings = (() => {
    const mainLocation = formatLocationString(profile.filters.mainPreferredLocation);
    const otherLocations = profile.filters.preferredLocations.map(formatLocationString);
    return [mainLocation, ...otherLocations];
  })();

  const longestLocation = locationStrings.reduce(
    (acc, current) => (current.length > acc.length ? current : acc),
    "",
  );

  const budgetMin = toInt(profile.filters?.budgetMin);
  const budgetMax = toInt(profile.filters?.budgetMax);
  const budgetLabel = `$${budgetMin}–$${budgetMax}`;

  const baseName = profile.displayName ?? `${profile.firstName} ${profile.lastName}`;
  const headline = `${baseName}, ${age}`;

  const mainPhoto = sanitizePhotoUrl(profile.photoUrl, FALLBACK_PRIMARY_PHOTO);
  const secondaryPhotos = Array.isArray(profile.secondaryPhotoUrls)
    ? profile.secondaryPhotoUrls.map(url => sanitizePhotoUrl(url, FALLBACK_SECONDARY_PHOTO))
    : [];
  const galleryPhotos = [mainPhoto, ...secondaryPhotos];

  return {
    age,
    basicInfo,
    locationStrings,
    longestLocation,
    budgetLabel,
    budgetFull: budgetLabel,
    headline,
    galleryPhotos,
    mainPhoto,
    mainLocation: locationStrings[0] ?? "—",
  };
}
