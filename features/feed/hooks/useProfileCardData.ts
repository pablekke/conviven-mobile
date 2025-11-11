import { useMemo } from "react";

import { calcAge, toInt } from "../utils/formatters";
import {
  PROFILE_TIDINESS_LABELS,
  PROFILE_SCHEDULE_LABELS,
  PROFILE_DIET_LABELS,
  PROFILE_OCCUPATION_LABELS,
  labelFromRecord,
} from "../../profile/i18n/profileLabels";

type NamedLocation = {
  department: { name: string };
  city: { name: string };
  neighborhood: { name: string };
};

type ProfileLike = {
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

export function mapProfileToCardData(profile: ProfileLike) {
  const age = calcAge(profile.birthDate);

  const basicInfo = [
    labelFromRecord(PROFILE_TIDINESS_LABELS, profile.profile.tidiness),
    labelFromRecord(PROFILE_SCHEDULE_LABELS, profile.profile.schedule),
    labelFromRecord(PROFILE_DIET_LABELS, profile.profile.diet),
    labelFromRecord(PROFILE_OCCUPATION_LABELS, profile.profile.occupation),
  ];

  const locationStrings = [
    formatLocationString(profile.filters.mainPreferredLocation),
    ...profile.filters.preferredLocations.map(formatLocationString),
  ];

  const longestLocation = locationStrings.reduce(
    (acc, current) => (current.length > acc.length ? current : acc),
    "",
  );

  const budgetLabel = (() => {
    const min = toInt(profile.filters?.budgetMin);
    const max = toInt(profile.filters?.budgetMax);
    return `$${min}–$${max}`;
  })();

  const baseName = profile.displayName ?? `${profile.firstName} ${profile.lastName}`;
  const headline = `${baseName}, ${age}`;

  const mainPhoto = sanitizePhotoUrl(profile.photoUrl, FALLBACK_PRIMARY_PHOTO);
  const secondaryPhotos = Array.isArray(profile.secondaryPhotoUrls)
    ? profile.secondaryPhotoUrls.map(url => sanitizePhotoUrl(url, FALLBACK_SECONDARY_PHOTO))
    : [];
  const galleryPhotos = [mainPhoto, ...secondaryPhotos];

  const mainLocation = locationStrings[0] ?? "—";

  return {
    age,
    basicInfo,
    locationStrings,
    longestLocation,
    budgetLabel,
    headline,
    galleryPhotos,
    mainPhoto,
    mainLocation,
  };
}

export function useProfileCardData(profile: ProfileLike) {
  return useMemo(() => mapProfileToCardData(profile), [profile]);
}
