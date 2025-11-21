import { memo, useCallback, useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { FeedScrollContext } from "../context/ScrollContext";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { BackgroundCard } from "./BackgroundCard";
import { PrimaryCard } from "./PrimaryCard";
import type { CardDeckCardProps, CardDeckProps } from "../types";
import { BlurView } from "expo-blur";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_DEG = 15;

const buildCardIdentity = (card: CardDeckCardProps) => {
  const firstPhoto = card.photos?.[0] ?? "";
  return `${firstPhoto}|${card.headline}|${card.budget}`;
};

function CardDeckComponent({
  scrollRef,
  className = "relative w-full",
  style,
  primary,
  secondary,
}: CardDeckProps) {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);

  // Shared Values
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  // State to track current card identity to reset animations
  const [currentPrimaryId, setCurrentPrimaryId] = useState(buildCardIdentity(primary));

  // Reset position when primary card changes
  useEffect(() => {
    const newId = buildCardIdentity(primary);
    if (newId !== currentPrimaryId) {
      // Reset instantly without animation
      translationX.value = 0;
      translationY.value = 0;
      setCurrentPrimaryId(newId);
    }
  }, [primary, currentPrimaryId, translationX, translationY]);

  const { onSwipeComplete } = primary;

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      if (onSwipeComplete) {
        onSwipeComplete(direction);
      }
    },
    [onSwipeComplete],
  );

  // Gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate(event => {
      translationX.value = event.translationX;
      // translationY.value = event.translationY; // Disable vertical movement
    })
    .onEnd(event => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "like" : "dislike";
        const targetX = direction === "like" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translationX.value = withTiming(targetX, { duration: 700 }, finished => {
          if (finished) {
            runOnJS(handleSwipeComplete)(direction);
          }
        });
      } else {
        translationX.value = withTiming(0, { duration: 200 });
        // translationY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  // Derived Values for Animations
  const rotate = useDerivedValue(() => {
    return interpolate(
      translationX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-ROTATION_DEG, 0, ROTATION_DEG],
      Extrapolation.CLAMP,
    );
  });

  const likeOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 4], [0, 1], Extrapolation.CLAMP);
  });

  const dislikeOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 4, 0], [1, 0], Extrapolation.CLAMP);
  });

  const nextCardScale = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH],
      [0.95, 1],
      Extrapolation.CLAMP,
    );
  });

  const nextCardBlur = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH / 2],
      [1, 0],
      Extrapolation.CLAMP,
    );
  });

  // Animated Styles
  const frontCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      // { translateY: translationY.value }, // Disable vertical movement
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const likeTintStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const dislikeTintStyle = useAnimatedStyle(() => ({
    opacity: dislikeOpacity.value,
  }));

  const backCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
  }));

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        {/* Secondary (Back) Card */}
        <Animated.View style={[styles.secondaryLayer, backCardStyle]}>
          <BackgroundCard
            {...secondary}
            blurEnabled
            blurProgress={nextCardBlur}
            enableLocationToggle
            showScrollCue
          />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject]}>
            <BlurView
              tint="systemUltraThinMaterialDark"
              intensity={20}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </Animated.View>

        {/* Primary (Front) Card */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.primaryLayer, frontCardStyle]}>
            <PrimaryCard {...primary} enableLocationToggle showScrollCue />

            {/* Like Tint (Blue) */}
            <Animated.View
              pointerEvents="none"
              style={[styles.tintLayer, styles.likeTint, likeTintStyle]}
            />

            {/* Dislike Tint (Red) */}
            <Animated.View
              pointerEvents="none"
              style={[styles.tintLayer, styles.dislikeTint, dislikeTintStyle]}
            />
          </Animated.View>
        </GestureDetector>
      </FeedScrollContext.Provider>
    </View>
  );
}

export const CardDeck = memo(CardDeckComponent);

const styles = StyleSheet.create({
  secondaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  primaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  likeTint: {
    backgroundColor: "rgba(64, 158, 255, 0.4)", // Blue-ish
  },
  dislikeTint: {
    backgroundColor: "rgba(255, 71, 87, 0.4)", // Red-ish
  },
});
