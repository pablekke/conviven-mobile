import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import { BackgroundCard } from "./BackgroundCard";
import { PrimaryCard } from "./PrimaryCard";
import { useProfileCardData } from "../hooks";

type FeedProfile = Parameters<typeof useProfileCardData>[0];
type SwipeDirection = "like" | "dislike";

interface ProfileDeckProps {
  profiles: FeedProfile[];
  locationWidth?: number;
  onActiveProfileChange?: (profile: FeedProfile) => void;
  onSwipeAction?: (profile: FeedProfile, direction: SwipeDirection) => void;
  onRequestMore?: (swipeCount: number) => void;
  onDeckExhausted?: () => void;
}

const MIN_QUEUE_SIZE = 3;
const INITIAL_PRELOAD = 4;
const REPLENISH_EVERY = 4;

type DeckState = {
  queue: FeedProfile[];
  cursor: number;
  swipeCount: number;
};

export function ProfileDeck({
  profiles,
  locationWidth,
  onActiveProfileChange,
  onSwipeAction,
  onRequestMore,
  onDeckExhausted,
}: ProfileDeckProps) {
  const { width: screenWidth } = useWindowDimensions();

  const initialQueue = useMemo(
    () => profiles.slice(0, Math.min(INITIAL_PRELOAD, profiles.length)),
    [profiles],
  );

  const [deckState, setDeckState] = useState<DeckState>(() => ({
    queue: initialQueue,
    cursor: initialQueue.length,
    swipeCount: 0,
  }));

  const [swipeValue, setSwipeValue] = useState<Animated.Value | null>(null);
  const [shouldRequestMore, setShouldRequestMore] = useState(false);

  const keyRegistry = useRef(new WeakMap<FeedProfile, string>());
  const keyCounter = useRef(0);
  const getProfileKey = useCallback((profile: FeedProfile) => {
    let key = keyRegistry.current.get(profile);
    if (!key) {
      key = `deck-profile-${keyCounter.current++}`;
      keyRegistry.current.set(profile, key);
    }
    return key;
  }, []);

  const frontProfile = deckState.queue[0];
  const nextProfile = deckState.queue[1];
  const thirdProfile = deckState.queue[2];
  const showScrollCue = deckState.swipeCount === 0;

  const handleSwipeXChange = useCallback((value: Animated.Value) => {
    setSwipeValue(prev => (prev === value ? prev : value));
  }, []);

  const frontOpacity = useMemo(() => {
    if (!swipeValue) return null;
    return swipeValue.interpolate({
      inputRange: [-screenWidth, -screenWidth * 0.3, 0, screenWidth * 0.3, screenWidth],
      outputRange: [0, 0.85, 1, 0.85, 0],
      extrapolate: "clamp",
    });
  }, [screenWidth, swipeValue]);

  const blurOpacity = useMemo(() => {
    if (!swipeValue) return null;
    const softEdge = screenWidth * 0.45;
    return swipeValue.interpolate({
      inputRange: [-screenWidth, -softEdge, 0, softEdge, screenWidth],
      outputRange: [0, 0.6, 1, 0.6, 0],
      extrapolate: "clamp",
    });
  }, [screenWidth, swipeValue]);

  const prevFrontRef = useRef<FeedProfile | undefined>();
  useEffect(() => {
    if (frontProfile) {
      onActiveProfileChange?.(frontProfile);
    } else if (prevFrontRef.current) {
      onDeckExhausted?.();
    }
    prevFrontRef.current = frontProfile;
  }, [frontProfile, onActiveProfileChange, onDeckExhausted]);

  useEffect(() => {
    if (!shouldRequestMore) return;
    onRequestMore?.(deckState.swipeCount);
    setShouldRequestMore(false);
  }, [shouldRequestMore, deckState.swipeCount, onRequestMore]);

  useEffect(() => {
    setDeckState(prev => {
      if (prev.cursor >= profiles.length) return prev;
      let cursor = prev.cursor;
      const queue = [...prev.queue];
      while (queue.length < MIN_QUEUE_SIZE && cursor < profiles.length) {
        queue.push(profiles[cursor]);
        cursor += 1;
      }
      if (cursor === prev.cursor) return prev;
      return { ...prev, queue, cursor };
    });
    setShouldRequestMore(false);
  }, [profiles]);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      if (!frontProfile) return;
      onSwipeAction?.(frontProfile, direction);

      setDeckState(prev => {
        if (prev.queue.length === 0) return prev;

        const [, ...rest] = prev.queue;
        let cursor = prev.cursor;
        const queue = [...rest];

        while (queue.length < MIN_QUEUE_SIZE && cursor < profiles.length) {
          queue.push(profiles[cursor]);
          cursor += 1;
        }

        const nextSwipeCount = prev.swipeCount + 1;
        const needsMore = queue.length < MIN_QUEUE_SIZE && cursor >= profiles.length;
        const periodicReload = nextSwipeCount % REPLENISH_EVERY === 0;

        if (needsMore || periodicReload) {
          setShouldRequestMore(true);
        }

        return { queue, cursor, swipeCount: nextSwipeCount };
      });

      setSwipeValue(null);
    },
    [frontProfile, onSwipeAction, profiles],
  );

  if (!frontProfile) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.emptyState]}>
          <Text style={styles.emptyTitle}>No hay más personas cerca</Text>
          <Text style={styles.emptySubtitle}>
            Actualizá más tarde para que carguemos nuevos perfiles.
          </Text>
        </View>
      </View>
    );
  }

  const cardWrapperStyle = frontOpacity ? { opacity: frontOpacity } : undefined;
  const frontKey = getProfileKey(frontProfile);
  const nextKey = nextProfile ? getProfileKey(nextProfile) : null;
  const thirdKey = thirdProfile ? getProfileKey(thirdProfile) : null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {nextProfile && nextKey ? (
        <DeckBackgroundCard
          key={`bg-${nextKey}`}
          profile={nextProfile}
          profileKey={nextKey}
          locationWidth={locationWidth}
          swipeX={swipeValue}
          screenWidth={screenWidth}
          blurOpacity={blurOpacity}
        />
      ) : null}

      <DeckPrimaryCard
        key={`front-${frontKey}`}
        profile={frontProfile}
        profileKey={frontKey}
        locationWidth={locationWidth}
        onSwipeComplete={handleSwipeComplete}
        onSwipeXChange={handleSwipeXChange}
        cardWrapperStyle={cardWrapperStyle}
        showScrollCue={showScrollCue}
      />

      {thirdProfile && thirdKey ? (
        <DeckImagePrefetcher key={`preload-${thirdKey}`} profile={thirdProfile} />
      ) : null}
    </View>
  );
}

type DeckPrimaryCardProps = {
  profile: FeedProfile;
  profileKey: string;
  locationWidth?: number;
  onSwipeComplete: (direction: SwipeDirection) => void;
  onSwipeXChange: (value: Animated.Value) => void;
  cardWrapperStyle?: StyleProp<ViewStyle>;
  showScrollCue: boolean;
};

function DeckPrimaryCard({
  profile,
  profileKey,
  locationWidth,
  onSwipeComplete,
  onSwipeXChange,
  cardWrapperStyle,
  showScrollCue,
}: DeckPrimaryCardProps) {
  const data = useProfileCardData(profile);

  return (
    <PrimaryCard
      key={profileKey}
      photos={data.galleryPhotos}
      locationStrings={data.locationStrings}
      locationWidth={locationWidth}
      headline={data.headline}
      budget={data.budgetLabel}
      basicInfo={data.basicInfo}
      onSwipeComplete={onSwipeComplete}
      onSwipeXChange={onSwipeXChange}
      cardWrapperStyle={cardWrapperStyle}
      showScrollCue={showScrollCue}
    />
  );
}

type DeckBackgroundCardProps = {
  profile: FeedProfile;
  profileKey: string;
  locationWidth?: number;
  swipeX: Animated.Value | null;
  screenWidth: number;
  blurOpacity: Animated.AnimatedInterpolation<number> | null;
};

function DeckBackgroundCard({
  profile,
  profileKey,
  locationWidth,
  swipeX,
  screenWidth,
  blurOpacity,
}: DeckBackgroundCardProps) {
  const data = useProfileCardData(profile);

  return (
    <BackgroundCard
      key={profileKey}
      photos={data.galleryPhotos}
      locationStrings={data.locationStrings}
      locationWidth={locationWidth}
      headline={data.headline}
      budget={data.budgetLabel}
      basicInfo={data.basicInfo}
      swipeX={swipeX ?? undefined}
      screenWidth={screenWidth}
      blurOpacity={blurOpacity ?? undefined}
    />
  );
}

function DeckImagePrefetcher({ profile }: { profile: FeedProfile }) {
  const { galleryPhotos } = useProfileCardData(profile);

  useEffect(() => {
    galleryPhotos.forEach(src => {
      if (typeof src === "string" && src.trim().length > 0) {
        Image.prefetch(src).catch(() => undefined);
      }
    });
  }, [galleryPhotos]);

  return null;
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(248, 250, 252, 0.7)",
    textAlign: "center",
  },
});

export default ProfileDeck;
