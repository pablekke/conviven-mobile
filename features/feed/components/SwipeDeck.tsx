import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

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

type InternalSnapshot = ActiveSnapshot & { key: string };

type SwipeDeckProps = {
  profiles: readonly ProfileCardSource[];
  locationWidth?: number;
  screenWidth?: number;
  onActiveProfileChange?: (snapshot: ActiveSnapshot | null) => void;
  onDecision?: (payload: { direction: SwipeDirection; profile: ProfileCardSource }) => void;
};

const BACKGROUND_PROMOTION_DELAY_MS = 420;
const TRANSITION_UNLOCK_DELAY_MS = 720;
const ACTIVE_FADE_IN_DURATION_MS = 220;
const OUTGOING_FADE_OUT_DURATION_MS = 260;
const OUTGOING_FADE_OUT_DELAY_MS = 40;

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
  const [activeReady, setActiveReady] = useState(false);
  const [outgoingSnapshot, setOutgoingSnapshot] = useState<InternalSnapshot | null>(null);

  const activeOpacity = useRef(new Animated.Value(1)).current;
  const outgoingOpacity = useRef(new Animated.Value(1)).current;

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
    setActiveReady(false);
    setOutgoingSnapshot(null);
    outgoingOpacity.setValue(1);
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

    if (!activeReady) {
      return;
    }

    const candidateIndex = index + 1;
    if (!totalCards || candidateIndex >= totalCards) {
      setBackgroundIndex(null);
      return;
    }

    backgroundDelayRef.current = setTimeout(() => {
      setBackgroundIndex(candidateIndex);
      const preview = cards[candidateIndex]?.galleryPhotos?.[0];
      if (preview) {
        Image.prefetch(preview).catch(() => undefined);
      }
      backgroundDelayRef.current = null;
    }, BACKGROUND_PROMOTION_DELAY_MS);

    return () => {
      if (backgroundDelayRef.current) {
        clearTimeout(backgroundDelayRef.current);
        backgroundDelayRef.current = null;
      }
    };
  }, [activeReady, cards, index, totalCards]);

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
    if (!activeReady) return;
    onActiveProfileChange({ profile: activeProfile, card: activeCard });
  }, [activeCard, activeProfile, activeReady, onActiveProfileChange]);

  useEffect(() => {
    if (!activeReady) return;
    Animated.timing(activeOpacity, {
      toValue: 1,
      duration: ACTIVE_FADE_IN_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [activeOpacity, activeReady]);

  useEffect(() => {
    if (!activeReady || !outgoingSnapshot) return;
    Animated.timing(outgoingOpacity, {
      toValue: 0,
      duration: OUTGOING_FADE_OUT_DURATION_MS,
      delay: OUTGOING_FADE_OUT_DELAY_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setOutgoingSnapshot(null);
      outgoingOpacity.setValue(1);
    });
  }, [activeReady, outgoingOpacity, outgoingSnapshot]);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      if (transitionLocked) return;
      const currentProfile = profiles[index];
      const currentCard = cards[index];
      if (currentProfile && currentCard) {
        const outgoingKey = `${currentProfile.firstName}-${currentProfile.lastName}-${currentProfile.birthDate}-outgoing-${index}`;
        setOutgoingSnapshot({ profile: currentProfile, card: currentCard, key: outgoingKey });
        onDecision?.({ direction, profile: currentProfile });
      }
      setActiveReady(false);
      activeOpacity.setValue(0);
      outgoingOpacity.setValue(1);
      setTransitionLocked(true);
      setBackgroundIndex(null);
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
    [activeOpacity, cards, index, onDecision, outgoingOpacity, profiles, transitionLocked],
  );

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setActiveSwipeX(value);
  }, []);

  const handleActiveReady = useCallback(() => {
    setActiveReady(prev => (prev ? prev : true));
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
      {outgoingSnapshot ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.outgoingLayer, { opacity: outgoingOpacity }]}
        >
          <PrimaryCard
            key={outgoingSnapshot.key}
            photos={outgoingSnapshot.card.galleryPhotos}
            locationStrings={outgoingSnapshot.card.locationStrings}
            locationWidth={locationWidth}
            headline={outgoingSnapshot.card.headline}
            budget={outgoingSnapshot.card.budgetLabel}
            basicInfo={outgoingSnapshot.card.basicInfo}
            enableSwipe={false}
            showScrollCue={false}
            enableLocationToggle={false}
          />
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.primaryLayer, { opacity: activeOpacity }]}
      >
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
          onReady={handleActiveReady}
          enableSwipe={!transitionLocked && activeReady}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    position: "relative",
  },
  primaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  outgoingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
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
