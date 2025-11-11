import { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";

import { PrimaryCard } from "./PrimaryCard";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import type { ProfileCardData } from "../utils/createProfileCardData";

export type SwipeDirection = "like" | "dislike";

export type DeckCard = {
  id: string;
  data: ProfileCardData;
};

interface SwipeDeckProps {
  active: DeckCard;
  next?: DeckCard | null;
  onSwipeComplete: (direction: SwipeDirection) => void;
  locationWidth?: number;
  screenWidth: number;
}

const SWIPE_EXIT_OFFSET = 160;
const VELOCITY_THRESHOLD = 1100;

export function SwipeDeck({
  active,
  next,
  onSwipeComplete,
  locationWidth,
  screenWidth,
}: SwipeDeckProps) {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const translateX = useSharedValue(0);
  const isInteracting = useSharedValue(false);

  useEffect(() => {
    translateX.value = 0;
    isInteracting.value = false;
  }, [active.id, isInteracting, translateX]);

  const likeThreshold = useMemo(() => screenWidth * 0.25, [screenWidth]);
  const hasNext = Boolean(next);

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .enableTrackpadTwoFingerGesture(true)
      .maxPointers(1)
      .activeOffsetX([-12, 12])
      .failOffsetY([-60, 60])
      .onBegin(() => {
        isInteracting.value = true;
      })
      .onUpdate(event => {
        translateX.value = event.translationX;
      })
      .onEnd(event => {
        const { translationX, velocityX } = event;
        if (translationX > likeThreshold || velocityX > VELOCITY_THRESHOLD) {
          translateX.value = withTiming(screenWidth + SWIPE_EXIT_OFFSET, { duration: 220 }, finished => {
            if (finished) {
              runOnJS(onSwipeComplete)("like");
            }
            translateX.value = 0;
            isInteracting.value = false;
          });
        } else if (translationX < -likeThreshold || velocityX < -VELOCITY_THRESHOLD) {
          translateX.value = withTiming(-screenWidth - SWIPE_EXIT_OFFSET, { duration: 220 }, finished => {
            if (finished) {
              runOnJS(onSwipeComplete)("dislike");
            }
            translateX.value = 0;
            isInteracting.value = false;
          });
        } else {
          translateX.value = withSpring(0, { damping: 18, stiffness: 220 }, () => {
            isInteracting.value = false;
          });
        }
      })
      .onFinalize(() => {
        if (!isInteracting.value) {
          translateX.value = 0;
        }
      })
      .runOnJS(true);
  }, [isInteracting, likeThreshold, onSwipeComplete, screenWidth, translateX]);

  const activeCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${(translateX.value / screenWidth) * 12}deg` },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => {
    if (!hasNext) return {};
    const offset = Math.abs(translateX.value);
    const scale = interpolate(offset, [0, screenWidth], [0.95, 1], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  const tintStyle = useAnimatedStyle(() => {
    if (!hasNext) return { opacity: 0 };
    const offset = Math.abs(translateX.value);
    const opacity = interpolate(
      offset,
      [0, likeThreshold, screenWidth],
      [0.85, 0.65, 0.5],
      Extrapolation.CLAMP,
    );
    const backgroundColor = interpolateColor(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      ["rgba(248,113,113,0.55)", "rgba(15,23,42,0.35)", "rgba(59,130,246,0.55)"],
    );
    return { backgroundColor, opacity };
  });

  return (
    <View style={[styles.root, { height: cardHeight }]}> 
      {next ? (
        <Animated.View pointerEvents="none" style={[styles.cardLayer, nextCardStyle]}>
          <PrimaryCard
            photos={next.data.galleryPhotos}
            locationStrings={next.data.locationStrings}
            locationWidth={locationWidth}
            headline={next.data.headline}
            budget={next.data.budgetLabel}
            basicInfo={next.data.basicInfo}
            enableSwipe={false}
            showScrollCue={false}
            enableLocationToggle={false}
          />
          <BlurView intensity={55} tint="dark" style={styles.overlay} />
          <Animated.View pointerEvents="none" style={[styles.overlay, tintStyle]} />
        </Animated.View>
      ) : null}

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardLayer, styles.activeLayer, activeCardStyle]}>
          <PrimaryCard
            photos={active.data.galleryPhotos}
            locationStrings={active.data.locationStrings}
            locationWidth={locationWidth}
            headline={active.data.headline}
            budget={active.data.budgetLabel}
            basicInfo={active.data.basicInfo}
            enableSwipe={false}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    position: "relative",
  },
  cardLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
  },
  activeLayer: {
    zIndex: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
