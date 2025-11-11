import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { PrimaryCard } from "./PrimaryCard";
import { BackgroundCard } from "./BackgroundCard";
import {
  ProfileCardData,
  ProfileCardSource,
  createProfileCardData,
} from "../utils/createProfileCardData";

type SwipeDirection = "like" | "dislike";

type ActiveSnapshot = {
  profile: ProfileCardSource;
  card: ProfileCardData;
};

type SwipeDeckProps = {
  profiles: readonly ProfileCardSource[];
  locationWidth?: number;
  screenWidth?: number;
  onActiveProfileChange?: (snapshot: ActiveSnapshot | null) => void;
  onDecision?: (payload: { direction: SwipeDirection; profile: ProfileCardSource }) => void;
};

const BACKGROUND_PROMOTION_DELAY_MS = 420;
const TRANSITION_UNLOCK_DELAY_MS = 720;

export function SwipeDeck({
  profiles,
  locationWidth,
  screenWidth,
  onActiveProfileChange,
  onDecision,
}: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const [activeSwipeX, setActiveSwipeX] = useState<Animated.Value | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState<number | null>(() =>
    profiles.length > 1 ? 1 : null,
  );
  const [transitionLocked, setTransitionLocked] = useState(false);

  const backgroundDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cards = useMemo(() => profiles.map(createProfileCardData), [profiles]);
  const totalCards = cards.length;
  const activeCard = cards[index];
  const nextCard = backgroundIndex != null ? cards[backgroundIndex] : undefined;
  const activeProfile = profiles[index];
  const nextProfile = backgroundIndex != null ? profiles[backgroundIndex] : undefined;

  const activeKey = useMemo(() => {
    if (!activeProfile) return null;
    return `${activeProfile.firstName}-${activeProfile.lastName}-${activeProfile.birthDate}-${index}`;
  }, [activeProfile, index]);

  const nextKey = useMemo(() => {
    if (!nextProfile) return null;
    return `${nextProfile.firstName}-${nextProfile.lastName}-${nextProfile.birthDate}-${backgroundIndex ?? index + 1}`;
  }, [backgroundIndex, index, nextProfile]);

  useEffect(() => {
    setIndex(0);
    setActiveSwipeX(null);
    setBackgroundIndex(profiles.length > 1 ? 1 : null);
    setTransitionLocked(false);
    if (backgroundDelayRef.current) {
      clearTimeout(backgroundDelayRef.current);
      backgroundDelayRef.current = null;
    }
    if (unlockDelayRef.current) {
      clearTimeout(unlockDelayRef.current);
      unlockDelayRef.current = null;
    }
  }, [profiles]);

  useEffect(() => {
    if (backgroundDelayRef.current) {
      clearTimeout(backgroundDelayRef.current);
      backgroundDelayRef.current = null;
    }

    const candidateIndex = index + 1;
    if (!totalCards || candidateIndex >= totalCards) {
      setBackgroundIndex(null);
      return;
    }

    backgroundDelayRef.current = setTimeout(() => {
      setBackgroundIndex(candidateIndex);
      backgroundDelayRef.current = null;
    }, BACKGROUND_PROMOTION_DELAY_MS);

    return () => {
      if (backgroundDelayRef.current) {
        clearTimeout(backgroundDelayRef.current);
        backgroundDelayRef.current = null;
      }
    };
  }, [index, totalCards]);

  useEffect(
    () => () => {
      if (backgroundDelayRef.current) {
        clearTimeout(backgroundDelayRef.current);
        backgroundDelayRef.current = null;
      }
      if (unlockDelayRef.current) {
        clearTimeout(unlockDelayRef.current);
        unlockDelayRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!onActiveProfileChange) return;
    if (!activeCard || !activeProfile) {
      onActiveProfileChange(null);
      return;
    }
    onActiveProfileChange({ profile: activeProfile, card: activeCard });
  }, [activeCard, activeProfile, onActiveProfileChange]);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      if (transitionLocked) return;
      const currentProfile = profiles[index];
      if (currentProfile) {
        onDecision?.({ direction, profile: currentProfile });
      }
      setTransitionLocked(true);
      setIndex(prev => prev + 1);
      setActiveSwipeX(null);
      if (unlockDelayRef.current) {
        clearTimeout(unlockDelayRef.current);
        unlockDelayRef.current = null;
      }
      unlockDelayRef.current = setTimeout(() => {
        setTransitionLocked(false);
        unlockDelayRef.current = null;
      }, TRANSITION_UNLOCK_DELAY_MS);
    },
    [index, onDecision, profiles, transitionLocked],
  );

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setActiveSwipeX(value);
  }, []);

  if (!activeCard || !activeProfile) {
    return (
      <View style={[styles.deckContainer, styles.emptyState]}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay más perfiles por ahora</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.deckContainer}>
      {nextCard ? (
        <BackgroundCard
          key={nextKey ?? `bg-${index + 1}`}
          photos={nextCard.galleryPhotos}
          locationStrings={nextCard.locationStrings}
          locationWidth={locationWidth}
          headline={nextCard.headline}
          budget={nextCard.budgetLabel}
          basicInfo={nextCard.basicInfo}
          swipeX={activeSwipeX ?? undefined}
          screenWidth={screenWidth}
        />
      ) : null}
      <PrimaryCard
        key={activeKey ?? `active-${index}`}
        photos={activeCard.galleryPhotos}
        locationStrings={activeCard.locationStrings}
        locationWidth={locationWidth}
        headline={activeCard.headline}
        budget={activeCard.budgetLabel}
        basicInfo={activeCard.basicInfo}
        onSwipeComplete={handleSwipeComplete}
        onSwipeXChange={handleSwipeXChange}
        enableSwipe={!transitionLocked}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "rgba(4, 10, 22, 0.55)",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
