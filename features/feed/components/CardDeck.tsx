import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ScrollView, ViewStyle } from "react-native";
import { I18nManager, Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { FeedScrollContext } from "../context/ScrollContext";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { BackgroundCard } from "./BackgroundCard";
import type { ProfileDeckItem } from "../utils/createProfileCardData";

type SwipeDirection = "like" | "dislike";

type CardDeckProps = {
  data: readonly ProfileDeckItem[];
  scrollRef: RefObject<ScrollView | null>;
  screenWidth?: number;
  className?: string;
  style?: ViewStyle;
  thresholdRatio?: number;
  hapticsEnabled?: boolean;
  onSwipeComplete?: (direction: SwipeDirection) => void;
  onActiveIndexChange?: (index: number) => void;
  onEnd?: () => void;
};

type SlotIndex = 0 | 1;

type SlotAssignments = readonly (number | null)[];

type HapticsModule = typeof import("expo-haptics");

let hapticsModule: HapticsModule | null | undefined;

async function triggerHaptic() {
  if (hapticsModule === undefined) {
    try {
      hapticsModule = await import("expo-haptics");
    } catch {
      hapticsModule = null;
    }
  }

  if (!hapticsModule) return;

  try {
    await hapticsModule.impactAsync(hapticsModule.ImpactFeedbackStyle.Medium);
  } catch {
    // Silenciar fallos de haptics opcionales
  }
}

function createInitialAssignments(length: number): SlotAssignments {
  if (length === 0) return [null, null];
  if (length === 1) return [0, null];
  return [0, 1];
}

function useStableStateSetter<T>(initial: T): [T, (value: T) => void, () => T] {
  const [state, setState] = useState(initial);
  const ref = useRef(state);
  const setStable = useCallback(
    (value: T) => {
      ref.current = value;
      setState(value);
    },
    [],
  );
  const getStable = useCallback(() => ref.current, []);
  return [state, setStable, getStable];
}

function CardDeckComponent({
  data,
  scrollRef,
  screenWidth,
  className = "relative w-full",
  style,
  thresholdRatio = 0.24,
  hapticsEnabled = false,
  onSwipeComplete,
  onActiveIndexChange,
  onEnd,
}: CardDeckProps) {
  const { height: winH, width: winW } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);
  const width = screenWidth ?? winW;

  const [assignments, setAssignments, getAssignments] = useStableStateSetter<SlotAssignments>(
    createInitialAssignments(data.length),
  );
  const [activeSlotState, setActiveSlotState, getActiveSlotState] = useStableStateSetter<SlotIndex>(0);
  const [activeIndex, setActiveIndex] = useStableStateSetter<number>(data.length > 0 ? 0 : -1);
  const [locationWidths, setLocationWidths] = useState<Record<number, number>>({});

  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const activeSlot = useSharedValue<SlotIndex>(0);
  const isAnimating = useSharedValue(false);
  const thresholdReached = useSharedValue(false);
  const blurOpacityA = useSharedValue(0);
  const blurOpacityB = useSharedValue(data.length > 1 ? 1 : 0);
  const blurOpacities = [blurOpacityA, blurOpacityB] as const;

  const directionFactor = I18nManager.isRTL ? -1 : 1;
  const likeThreshold = width * thresholdRatio;
  const velocityTrigger = width * 2;

  const resetActiveCard = useCallback(() => {
    translateX.value = 0;
    cardOpacity.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
    isAnimating.value = false;
    thresholdReached.value = false;
  }, [cardOpacity, isAnimating, thresholdReached, translateX]);

  useEffect(() => {
    const initialAssignments = createInitialAssignments(data.length);
    setAssignments(initialAssignments);
    setActiveSlotState(0);
    activeSlot.value = 0;
    blurOpacities[0].value = 0;
    blurOpacities[1].value = data.length > 1 ? 1 : 0;

    if (data.length > 0) {
      setActiveIndex(0);
      onActiveIndexChange?.(0);
    } else {
      setActiveIndex(-1);
    }
    setLocationWidths({});
  }, [
    activeSlot,
    blurOpacities,
    data.length,
    onActiveIndexChange,
    setActiveIndex,
    setActiveSlotState,
    setAssignments,
  ]);

  useEffect(() => {
    const indices = new Set<number>();
    assignments.forEach(index => {
      if (typeof index === "number") {
        indices.add(index);
      }
    });
    indices.forEach(index => {
      const photo = data[index]?.primary.mainPhoto;
      if (!photo) return;
      void Image.prefetch(photo).catch(() => undefined);
    });
  }, [assignments, data]);

  const ensureMeasurementForIndex = useCallback(
    (index: number, measuredWidth: number) => {
      setLocationWidths(prev => {
        if (prev[index] === measuredWidth) return prev;
        return { ...prev, [index]: measuredWidth };
      });
    },
    [],
  );

  const pendingMeasurementIndices = useMemo(() => {
    const indices = new Set<number>();
    if (activeIndex >= 0 && locationWidths[activeIndex] == null) {
      indices.add(activeIndex);
    }
    const otherSlot: SlotIndex = activeSlotState === 0 ? 1 : 0;
    const otherIndex = assignments[otherSlot];
    if (typeof otherIndex === "number" && locationWidths[otherIndex] == null) {
      indices.add(otherIndex);
    }
    return Array.from(indices);
  }, [activeIndex, activeSlotState, assignments, locationWidths]);

  const likeOverlayStyle = useAnimatedStyle(() => {
    const x = translateX.value * directionFactor;
    const opacity = interpolate(
      x,
      [0, likeThreshold, width],
      [0, 0.35, 0.55],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      backgroundColor: "rgba(34,197,94,0.7)",
    };
  }, [directionFactor, likeThreshold, translateX, width]);

  const dislikeOverlayStyle = useAnimatedStyle(() => {
    const x = translateX.value * directionFactor;
    const opacity = interpolate(
      x,
      [-width, -likeThreshold, 0],
      [0.6, 0.45, 0],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      backgroundColor: "rgba(239,68,68,0.75)",
    };
  }, [directionFactor, likeThreshold, translateX, width]);

  const slotStyles = [
    useAnimatedStyle(() => {
      const isActiveSlot = activeSlot.value === 0;
      return {
        zIndex: isActiveSlot ? 4 : 2,
        opacity: isActiveSlot ? cardOpacity.value : 1,
        transform: isActiveSlot
          ? [
              { translateX: translateX.value },
              {
                rotateZ: `${interpolate(
                  translateX.value,
                  [-width, 0, width],
                  [-10 * directionFactor, 0, 10 * directionFactor],
                  Extrapolate.CLAMP,
                )}deg`,
              },
            ]
          : [],
      };
    }, [activeSlot, cardOpacity, directionFactor, translateX, width]),
    useAnimatedStyle(() => {
      const isActiveSlot = activeSlot.value === 1;
      return {
        zIndex: isActiveSlot ? 4 : 2,
        opacity: isActiveSlot ? cardOpacity.value : 1,
        transform: isActiveSlot
          ? [
              { translateX: translateX.value },
              {
                rotateZ: `${interpolate(
                  translateX.value,
                  [-width, 0, width],
                  [-10 * directionFactor, 0, 10 * directionFactor],
                  Extrapolate.CLAMP,
                )}deg`,
              },
            ]
          : [],
      };
    }, [activeSlot, cardOpacity, directionFactor, translateX, width]),
  ] as const;

  const handleSwipeCompletion = useCallback(
    (direction: SwipeDirection) => {
      const currentAssignments = getAssignments();
      const frontSlot = getActiveSlotState();
      const backSlot: SlotIndex = frontSlot === 0 ? 1 : 0;
      const nextIndex = currentAssignments[backSlot];

      onSwipeComplete?.(direction);

      if (typeof nextIndex !== "number") {
        setAssignments([null, null]);
        setActiveIndex(data.length);
        blurOpacities[frontSlot].value = withTiming(0, { duration: 140 });
        blurOpacities[backSlot].value = withTiming(0, { duration: 140 });
        resetActiveCard();
        onEnd?.();
        return;
      }

      activeSlot.value = backSlot;
      setActiveSlotState(backSlot);

      setActiveIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);

      const upcomingIndex = nextIndex + 1 < data.length ? nextIndex + 1 : null;
      const newAssignments: SlotAssignments = frontSlot === 0
        ? [upcomingIndex, nextIndex]
        : [nextIndex, upcomingIndex];
      setAssignments(newAssignments);

      if (typeof upcomingIndex === "number") {
        const photo = data[upcomingIndex]?.primary.mainPhoto;
        if (photo) {
          void Image.prefetch(photo).catch(() => undefined);
        }
      }

      blurOpacities[backSlot].value = withTiming(0, { duration: 140 });
      blurOpacities[frontSlot].value = withTiming(upcomingIndex == null ? 0 : 1, { duration: 140 });

      resetActiveCard();
    },
    [
      activeSlot,
      blurOpacities,
      data,
      getActiveSlotState,
      getAssignments,
      onActiveIndexChange,
      onEnd,
      onSwipeComplete,
      resetActiveCard,
      setActiveIndex,
      setActiveSlotState,
      setAssignments,
    ],
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(data.length > 0)
      .onBegin(() => {
        thresholdReached.value = false;
      })
      .onUpdate(event => {
        if (isAnimating.value) return;
        translateX.value = event.translationX;
        const x = Math.abs(event.translationX);
        if (!hapticsEnabled) return;
        if (!thresholdReached.value && x >= likeThreshold) {
          thresholdReached.value = true;
          runOnJS(triggerHaptic)();
        } else if (thresholdReached.value && x < likeThreshold * 0.85) {
          thresholdReached.value = false;
        }
      })
      .onEnd(event => {
        if (isAnimating.value) return;
        const projected = event.translationX + event.velocityX * 0.2;
        const projectedDirectional = projected * directionFactor;
        const velocityDirectional = event.velocityX * directionFactor;

        const shouldLike =
          projectedDirectional > likeThreshold || velocityDirectional > velocityTrigger;
        const shouldDislike =
          projectedDirectional < -likeThreshold || velocityDirectional < -velocityTrigger;

        if (!shouldLike && !shouldDislike) {
          translateX.value = withSpring(0, {
            damping: 15,
            stiffness: 180,
            mass: 0.8,
            velocity: event.velocityX,
          });
          return;
        }

        isAnimating.value = true;
        const direction: SwipeDirection = shouldLike ? "like" : "dislike";
        const exitX = (shouldLike ? width + 160 : -width - 160) * directionFactor;

        cardOpacity.value = withTiming(0, { duration: 140, easing: Easing.inOut(Easing.ease) });
        translateX.value = withTiming(
          exitX,
          { duration: 220, easing: Easing.out(Easing.cubic) },
          finished => {
            if (!finished) return;
            runOnJS(handleSwipeCompletion)(direction);
          },
        );
      })
      .onFinalize(() => {
        if (!isAnimating.value) {
          resetActiveCard();
        }
      });
  }, [
    cardOpacity,
    data.length,
    directionFactor,
    handleSwipeCompletion,
    hapticsEnabled,
    isAnimating,
    likeThreshold,
    resetActiveCard,
    thresholdReached,
    translateX,
    velocityTrigger,
    width,
  ]);

  const slotData = useMemo(() => {
    return assignments.map(index => (typeof index === "number" ? data[index] ?? null : null)) as const;
  }, [assignments, data]);

  const slotLocationWidths = useMemo(
    () =>
      assignments.map(index => (typeof index === "number" ? locationWidths[index] ?? undefined : undefined)) as const,
    [assignments, locationWidths],
  );

  const hasCards = slotData.some(Boolean);

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        <GestureDetector gesture={panGesture}>
          <View style={StyleSheet.absoluteFill}>
            {slotData.map((item, slot) => {
              const slotIndex = slot as SlotIndex;
              if (!item) return null;
              return (
                <BackgroundCard
                  key={item.id + slotIndex}
                  data={item.primary}
                  heroHeight={heroImageHeight}
                  pointerEvents={activeSlotState === slotIndex ? "auto" : "none"}
                  cardStyle={slotStyles[slotIndex]}
                  blurOpacity={blurOpacities[slotIndex]}
                  likeStyle={activeSlotState === slotIndex ? likeOverlayStyle : undefined}
                  dislikeStyle={activeSlotState === slotIndex ? dislikeOverlayStyle : undefined}
                  locationWidth={slotLocationWidths[slotIndex]}
                  enableLocationToggle={activeSlotState === slotIndex}
                />
              );
            })}
            {!hasCards ? <View style={StyleSheet.absoluteFill} pointerEvents="none" /> : null}
          </View>
        </GestureDetector>

        <View pointerEvents="none" style={styles.measureLayer}>
          {pendingMeasurementIndices.map(index => {
            const item = data[index];
            if (!item) return null;
            return (
              <View
                key={`measure-${item.id}`}
                style={styles.measureRow}
                onLayout={event => {
                  const measured = event.nativeEvent.layout.width;
                  const capped = Math.min(measured, width * 0.7);
                  ensureMeasurementForIndex(index, capped);
                }}
              >
                <View style={styles.measureTextWrapper}>
                  <Text numberOfLines={1} style={styles.measureText}>
                    {item.primary.longestLocation}
                  </Text>
                </View>
                <View style={styles.measureIcon} />
              </View>
            );
          })}
        </View>
      </FeedScrollContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  measureLayer: {
    position: "absolute",
    top: -9999,
    left: 0,
  },
  measureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  measureTextWrapper: {
    flex: 1,
  },
  measureText: {
    fontSize: 13,
    fontWeight: "600",
  },
  measureIcon: {
    width: 14,
    height: 14,
  },
});

export const CardDeck = memo(CardDeckComponent);
