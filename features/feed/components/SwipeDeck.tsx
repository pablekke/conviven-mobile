import { useCallback, useEffect, useMemo, useState } from "react";
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

export function SwipeDeck({
  profiles,
  locationWidth,
  screenWidth,
  onActiveProfileChange,
  onDecision,
}: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const [activeSwipeX, setActiveSwipeX] = useState<Animated.Value | null>(null);

  const cards = useMemo(() => profiles.map(createProfileCardData), [profiles]);
  const activeCard = cards[index];
  const nextCard = cards[index + 1];
  const activeProfile = profiles[index];

  useEffect(() => {
    setIndex(0);
  }, [profiles]);

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
      const currentProfile = profiles[index];
      if (currentProfile) {
        onDecision?.({ direction, profile: currentProfile });
      }
      setIndex(prev => prev + 1);
    },
    [index, onDecision, profiles],
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
        photos={activeCard.galleryPhotos}
        locationStrings={activeCard.locationStrings}
        locationWidth={locationWidth}
        headline={activeCard.headline}
        budget={activeCard.budgetLabel}
        basicInfo={activeCard.basicInfo}
        onSwipeComplete={handleSwipeComplete}
        onSwipeXChange={handleSwipeXChange}
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
