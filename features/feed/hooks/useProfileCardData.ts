import { useMemo } from "react";

import { calcAge, formatBudgetToThousands } from "../utils/formatters";
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

export type ProfileLike = {
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

function formatLocationString(location: NamedLocation, isFirst: boolean = false) {
  const departmentName = location.department.name?.trim() ?? "";
  const isMontevideo = departmentName.toLowerCase() === "montevideo";
  const neighborhoodName = location.neighborhood.name?.trim() ?? "";

  if (isMontevideo) {
    if (isFirst) {
      return `Montevideo · ${neighborhoodName}`;
    }
    return neighborhoodName;
  }

  return `${location.department.name} · ${location.city.name} · ${location.neighborhood.name}`;
}

export function useProfileCardData(profile: ProfileLike | null | undefined) {
  const age = useMemo(() => {
    if (!profile?.birthDate) return 0;
    return calcAge(profile.birthDate);
  }, [profile?.birthDate]);

  const basicInfo = useMemo(() => {
    if (!profile?.profile) return [];
    return [
      labelFromRecord(PROFILE_TIDINESS_LABELS, profile.profile.tidiness),
      labelFromRecord(PROFILE_SCHEDULE_LABELS, profile.profile.schedule),
      labelFromRecord(PROFILE_DIET_LABELS, profile.profile.diet),
      labelFromRecord(PROFILE_OCCUPATION_LABELS, profile.profile.occupation),
    ];
  }, [profile?.profile]);

  const locationStrings = useMemo(() => {
    if (!profile?.filters?.mainPreferredLocation) return ["—"];
    const mainLocation = formatLocationString(profile.filters.mainPreferredLocation, true);
    const otherLocations =
      profile.filters.preferredLocations?.map(loc => formatLocationString(loc, false)) ?? [];
    return [mainLocation, ...otherLocations];
  }, [profile?.filters]);

  const longestLocation = useMemo(
    () =>
      locationStrings.reduce((acc, current) => (current.length > acc.length ? current : acc), ""),
    [locationStrings],
  );

  const budgetLabel = useMemo(() => {
    if (!profile?.filters) return "$0–$0";
    const min = formatBudgetToThousands(profile.filters.budgetMin);
    const max = formatBudgetToThousands(profile.filters.budgetMax);
    return `$${min}–$${max}`;
  }, [profile?.filters]);

  const headline = useMemo(() => {
    if (!profile) return "";
    const baseName = profile.displayName ?? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`;
    return `${baseName}, ${age}`;
  }, [age, profile]);

  const galleryPhotos = useMemo(() => {
    if (!profile) return [];
    const mainPhoto = profile.photoUrl ? String(profile.photoUrl) : "";
    const secondaryPhotos = Array.isArray(profile.secondaryPhotoUrls)
      ? profile.secondaryPhotoUrls.filter((url): url is string => !!url).map(String)
      : [];
    const allPhotos = mainPhoto ? [mainPhoto, ...secondaryPhotos] : secondaryPhotos;
    return allPhotos;
  }, [profile]);

  const mainPhoto = galleryPhotos[0];
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
