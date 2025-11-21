import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "react-native";

import { mapBackendToProfileLike, type MockedBackendUser } from "../mocks/incomingProfile";
import { useProfileCardData, type ProfileLike } from "./useProfileCardData";

type SwipeDirection = "like" | "dislike";

const EMPTY_LOCATION = {
  department: { name: "Mongolandia" },
  city: { name: "Mongolandia" },
  neighborhood: { name: "Mongolandia" },
};

const EMPTY_PROFILE: ProfileLike = {
  firstName: "",
  lastName: "",
  displayName: "",
  birthDate: "2000-01-01",
  photoUrl: null,
  secondaryPhotoUrls: [],
  profile: {
    tidiness: null,
    schedule: null,
    diet: null,
    occupation: null,
  },
  filters: {
    budgetMin: 0,
    budgetMax: 0,
    mainPreferredLocation: EMPTY_LOCATION,
    preferredLocations: [],
  },
};

export type DeckCardSnapshot = ReturnType<typeof useProfileCardData>;

type UseProfileDeckResult = {
  activeIndex: number;
  total: number;
  primaryProfile: ProfileLike | null;
  secondaryProfile: ProfileLike | null;
  tertiaryProfile: ProfileLike | null;
  primaryCard: DeckCardSnapshot;
  secondaryCard: DeckCardSnapshot;
  tertiaryCard: DeckCardSnapshot;
  primaryBackend: MockedBackendUser | null;
  secondaryBackend: MockedBackendUser | null;
  tertiaryBackend: MockedBackendUser | null;
  hasSecondary: boolean;
  hasTertiary: boolean;
  advance: (direction: SwipeDirection) => boolean;
  activeBackendProfile: MockedBackendUser | null;
};

export function useProfileDeck(profiles: readonly MockedBackendUser[]): UseProfileDeckResult {
  const profileLikes = useMemo(() => profiles.map(mapBackendToProfileLike), [profiles]);

  const [cursor, setCursor] = useState(0);

  const clampedCursor = useMemo(() => {
    if (profileLikes.length === 0) return 0;
    return Math.min(cursor, profileLikes.length - 1);
  }, [cursor, profileLikes.length]);

  useEffect(() => {
    if (cursor === clampedCursor) return;
    setCursor(clampedCursor);
  }, [clampedCursor, cursor]);

  const fallbackProfile = profileLikes[0] ?? EMPTY_PROFILE;

  const primaryProfile = profileLikes[clampedCursor] ?? null;
  const secondaryIndex = clampedCursor + 1 < profileLikes.length ? clampedCursor + 1 : null;
  const tertiaryIndex = clampedCursor + 2 < profileLikes.length ? clampedCursor + 2 : null;

  const primaryBackend = profiles[clampedCursor] ?? null;
  const secondaryBackend = secondaryIndex != null ? profiles[secondaryIndex] : null;
  const tertiaryBackend = tertiaryIndex != null ? profiles[tertiaryIndex] : null;

  const secondaryProfile = secondaryIndex != null ? profileLikes[secondaryIndex] : null;
  const tertiaryProfile = tertiaryIndex != null ? profileLikes[tertiaryIndex] : null;

  const primaryCard = useProfileCardData(primaryProfile ?? fallbackProfile);
  const secondaryCard = useProfileCardData(secondaryProfile ?? EMPTY_PROFILE);
  const tertiaryCard = useProfileCardData(tertiaryProfile ?? EMPTY_PROFILE);

  const advance = useCallback(
    (_direction: SwipeDirection) => {
      if (profileLikes.length === 0) return false;
      if (cursor >= profileLikes.length - 1) {
        return false;
      }
      setCursor(prev => prev + 1);
      return true;
    },
    [cursor, profileLikes.length],
  );

  const activeBackendProfile =
    profiles[clampedCursor] ?? (profiles.length > 0 ? profiles[profiles.length - 1] : null);

  const prefetchedSecondaryRef = useRef<number | null>(null);
  useEffect(() => {
    if (secondaryIndex == null || !secondaryProfile) return;
    if (prefetchedSecondaryRef.current === secondaryIndex) return;
    prefetchedSecondaryRef.current = secondaryIndex;

    secondaryCard.galleryPhotos.forEach(src => {
      if (typeof src !== "string" || src.trim().length === 0) return;
      Image.prefetch(src).catch(() => undefined);
    });
  }, [secondaryIndex, secondaryProfile, secondaryCard.galleryPhotos]);

  const prefetchedIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (tertiaryIndex == null || !tertiaryProfile) return;
    if (prefetchedIndexRef.current === tertiaryIndex) return;
    prefetchedIndexRef.current = tertiaryIndex;

    tertiaryCard.galleryPhotos.forEach(src => {
      if (typeof src !== "string" || src.trim().length === 0) return;
      Image.prefetch(src).catch(() => undefined);
    });
  }, [tertiaryIndex, tertiaryProfile, tertiaryCard.galleryPhotos]);

  return {
    activeIndex: clampedCursor,
    total: profileLikes.length,
    primaryProfile,
    secondaryProfile,
    tertiaryProfile,
    primaryCard,
    secondaryCard,
    tertiaryCard,
    primaryBackend,
    secondaryBackend,
    tertiaryBackend,
    hasSecondary: secondaryIndex != null,
    hasTertiary: tertiaryIndex != null,
    advance,
    activeBackendProfile,
  };
}
