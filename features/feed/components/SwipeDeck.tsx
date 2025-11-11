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

const OUTGOING_FADE_OUT_DURATION_MS = 240;

function buildProfileKey(profile: ProfileCardSource, suffix: string) {
  return `${profile.firstName}-${profile.lastName}-${profile.birthDate}-${suffix}`;
}

export function SwipeDeck({
  profiles,
  locationWidth,
  screenWidth,
  onActiveProfileChange,
  onDecision,
}: SwipeDeckProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(() =>
    profiles.length > 0 ? 0 : null,
  );
  const [nextIndex, setNextIndex] = useState<number | null>(() =>
    profiles.length > 1 ? 1 : null,
  );
  const [activeSwipeX, setActiveSwipeX] = useState<Animated.Value | null>(null);
  const [activeReady, setActiveReady] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [outgoingSnapshot, setOutgoingSnapshot] = useState<InternalSnapshot | null>(null);

  const outgoingOpacity = useRef(new Animated.Value(1)).current;

  const cards = useMemo(() => profiles.map(createProfileCardData), [profiles]);

  const activeCard = activeIndex != null ? cards[activeIndex] : undefined;
  const nextCard = nextIndex != null ? cards[nextIndex] : undefined;
  const activeProfile = activeIndex != null ? profiles[activeIndex] : undefined;
  const nextProfile = nextIndex != null ? profiles[nextIndex] : undefined;

  useEffect(() => {
    setActiveIndex(profiles.length > 0 ? 0 : null);
    setNextIndex(profiles.length > 1 ? 1 : null);
    setActiveReady(false);
    setTransitioning(false);
    setActiveSwipeX(null);
    setOutgoingSnapshot(null);
    outgoingOpacity.setValue(1);
  }, [profiles, outgoingOpacity]);

  useEffect(() => {
    if (nextIndex == null) return;
    const preview = cards[nextIndex]?.galleryPhotos?.[0];
    if (preview) {
      Image.prefetch(preview).catch(() => undefined);
    }
    const afterNext = nextIndex + 1;
    if (afterNext < cards.length) {
      const aheadPreview = cards[afterNext]?.galleryPhotos?.[0];
      if (aheadPreview) {
        Image.prefetch(aheadPreview).catch(() => undefined);
      }
    }
  }, [cards, nextIndex]);

  const notifyActiveChange = useCallback(
    (snapshot: ActiveSnapshot | null) => {
      onActiveProfileChange?.(snapshot);
    },
    [onActiveProfileChange],
  );

  const fadeOutgoing = useCallback(
    (snapshotKey?: string) => {
      if (!outgoingSnapshot && !snapshotKey) return;
      Animated.timing(outgoingOpacity, {
        toValue: 0,
        duration: OUTGOING_FADE_OUT_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        outgoingOpacity.setValue(1);
        setOutgoingSnapshot(prev => {
          if (!prev) return null;
          if (snapshotKey && prev.key !== snapshotKey) {
            return prev;
          }
          return null;
        });
      });
    },
    [outgoingOpacity, outgoingSnapshot],
  );

  useEffect(() => {
    if (!activeCard || !activeProfile || activeIndex == null) {
      notifyActiveChange(null);
      return;
    }
    if (!activeReady) {
      return;
    }
    notifyActiveChange({ profile: activeProfile, card: activeCard });
  }, [activeCard, activeIndex, activeProfile, activeReady, notifyActiveChange]);

  useEffect(() => {
    if (!activeReady) return;
    setTransitioning(false);
    fadeOutgoing();
  }, [activeReady, fadeOutgoing]);

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setActiveSwipeX(value);
  }, []);

  const handleActiveReady = useCallback(() => {
    setActiveReady(true);
  }, []);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      if (transitioning || activeIndex == null) return;
      const currentProfile = profiles[activeIndex];
      const currentCard = cards[activeIndex];
      if (!currentProfile || !currentCard) return;

      onDecision?.({ direction, profile: currentProfile });

      const outgoingKey = buildProfileKey(currentProfile, `outgoing-${activeIndex}`);
      const snapshot: InternalSnapshot = {
        profile: currentProfile,
        card: currentCard,
        key: outgoingKey,
      };
      setOutgoingSnapshot(snapshot);
      outgoingOpacity.setValue(1);
      setActiveReady(false);
      setTransitioning(true);
      setActiveSwipeX(null);

      const newActiveIndex = nextIndex;
      if (newActiveIndex == null) {
        setActiveIndex(null);
        setNextIndex(null);
        setTransitioning(false);
        fadeOutgoing(snapshot.key);
        notifyActiveChange(null);
        return;
      }

      setActiveIndex(newActiveIndex);
      const candidateNext = newActiveIndex + 1;
      setNextIndex(candidateNext < cards.length ? candidateNext : null);
    },
    [
      activeIndex,
      cards,
      fadeOutgoing,
      nextIndex,
      notifyActiveChange,
      onDecision,
      outgoingOpacity,
      profiles,
      transitioning,
    ],
  );

  const hasActive = activeCard != null && activeProfile != null && activeIndex != null;

  if (!hasActive && !outgoingSnapshot) {
    return (
      <View style={[styles.deckContainer, styles.emptyState]}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay más perfiles por ahora</Text>
        </View>
      </View>
    );
  }

  const activeContext = hasActive
    ? {
        card: activeCard!,
        profile: activeProfile!,
        index: activeIndex!,
      }
    : null;
  const activeKey = activeContext
    ? buildProfileKey(activeContext.profile, `active-${activeContext.index}`)
    : undefined;
  const nextKey =
    hasActive && nextProfile != null && nextIndex != null
      ? buildProfileKey(nextProfile, `background-${nextIndex}`)
      : undefined;
  const showBackground =
    hasActive && !transitioning && activeReady && nextCard != null && nextProfile != null;

  return (
    <View style={styles.deckContainer}>
      {showBackground ? (
        <BackgroundCard
          key={nextKey}
          photos={nextCard!.galleryPhotos}
          locationStrings={nextCard!.locationStrings}
          locationWidth={locationWidth}
          headline={nextCard!.headline}
          budget={nextCard!.budgetLabel}
          basicInfo={nextCard!.basicInfo}
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

      {hasActive && activeContext ? (
        <View pointerEvents="box-none" style={styles.primaryLayer}>
          <PrimaryCard
            key={activeKey}
            photos={activeContext.card.galleryPhotos}
            locationStrings={activeContext.card.locationStrings}
            locationWidth={locationWidth}
            headline={activeContext.card.headline}
            budget={activeContext.card.budgetLabel}
            basicInfo={activeContext.card.basicInfo}
            onSwipeComplete={handleSwipeComplete}
            onSwipeXChange={handleSwipeXChange}
            onReady={handleActiveReady}
            enableSwipe={activeReady && !transitioning}
          />
        </View>
      ) : null}
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
