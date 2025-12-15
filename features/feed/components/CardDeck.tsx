import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";
import { StyleSheet, View, useWindowDimensions, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardDeckCardProps, CardDeckProps } from "../types";
import { FeedScrollContext } from "../context/ScrollContext";
import { BackgroundCard } from "./BackgroundCard";
import { EmptyFeedCard } from "./EmptyFeedCard";
import { Image as ExpoImage } from "expo-image";
import { PrimaryCard } from "./PrimaryCard";
import { SwipeLabel } from "./SwipeLabel";
import { BlurView } from "expo-blur";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  useAnimatedProps,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
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

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const [currentPrimaryId, setCurrentPrimaryId] = useState(buildCardIdentity(primary));
  const [isSwipeLocked, setIsSwipeLocked] = useState(false);
  const swipeUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const secondaryId = useMemo(() => buildCardIdentity(secondary), [secondary]);

  useEffect(() => {
    const newId = buildCardIdentity(primary);
    if (newId !== currentPrimaryId) {
      translationX.value = 0;
      translationY.value = 0;
      setCurrentPrimaryId(newId);
    }
  }, [primary, currentPrimaryId, translationX, translationY]);

  useEffect(() => {
    return () => {
      if (swipeUnlockTimerRef.current) {
        clearTimeout(swipeUnlockTimerRef.current);
        swipeUnlockTimerRef.current = null;
      }
    };
  }, []);

  const prefetchSecondary = useCallback(() => {
    const urls = (secondary.photos ?? []).filter(Boolean);
    if (urls.length === 0) return;
    // Prefetch en background (no bloquea el swap).
    ExpoImage.prefetch(urls, { cachePolicy: "memory-disk" }).catch(() => undefined);
  }, [secondary.photos]);

  // Prefetch cada vez que cambia la carta que está por detrás.
  useEffect(() => {
    prefetchSecondary();
  }, [prefetchSecondary, secondaryId]);

  const { onSwipeComplete } = primary;

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      // Swap inmediato: NO esperamos el prefetch, porque eso deja visible la carta de atrás.
      if (onSwipeComplete) {
        onSwipeComplete(direction);
      }

      if (swipeUnlockTimerRef.current) {
        clearTimeout(swipeUnlockTimerRef.current);
      }
      swipeUnlockTimerRef.current = setTimeout(() => {
        setIsSwipeLocked(false);
        swipeUnlockTimerRef.current = null;
      }, 700);
    },
    [onSwipeComplete],
  );

  // Gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate(event => {
      if (isSwipeLocked) return;
      translationX.value = event.translationX;
    })
    .onEnd(event => {
      if (isSwipeLocked) return;
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "like" : "dislike";
        const targetX = direction === "like" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        // Arrancamos el prefetch mientras corre la animación de swipe.
        runOnJS(prefetchSecondary)();

        runOnJS(setIsSwipeLocked)(true);

        translationX.value = withTiming(targetX, { duration: 700 }, finished => {
          if (finished) {
            runOnJS(handleSwipeComplete)(direction);
          }
        });
      } else {
        translationX.value = withTiming(0, { duration: 320 });
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

  const likeLabelOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 6], [0, 1], Extrapolation.CLAMP);
  });

  const dislikeLabelOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 6, 0], [1, 0], Extrapolation.CLAMP);
  });

  const likeLabelScale = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 4], [0.8, 1], Extrapolation.CLAMP);
  });

  const dislikeLabelScale = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 4, 0], [1, 0.8], Extrapolation.CLAMP);
  });

  const nextCardScale = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH],
      [0.95, 1],
      Extrapolation.CLAMP,
    );
  });

  const blurIntensity = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH],
      [60, 0],
      Extrapolation.CLAMP,
    );
  });

  const blurProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
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

  const likeLabelStyle = useAnimatedStyle(() => ({
    opacity: likeLabelOpacity.value,
    transform: [{ scale: likeLabelScale.value }],
  }));

  const dislikeLabelStyle = useAnimatedStyle(() => ({
    opacity: dislikeLabelOpacity.value,
    transform: [{ scale: dislikeLabelScale.value }],
  }));

  const backCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
  }));

  return (
    <View className={className} style={[{ height: heroImageHeight }, style]}>
      <FeedScrollContext.Provider value={scrollRef}>
        {/* Secondary (Back) Card */}
        <Animated.View style={[styles.secondaryLayer, backCardStyle]}>
          {secondary.photos && secondary.photos.length > 0 ? (
            <>
              <BackgroundCard
                {...secondary}
                blurEnabled={false}
                enableLocationToggle
                showScrollCue
              />
              <AnimatedBlurView
                tint="systemUltraThinMaterialDark"
                animatedProps={blurProps}
                style={StyleSheet.absoluteFillObject}
              />
            </>
          ) : (
            <EmptyFeedCard />
          )}
        </Animated.View>

        {/* Primary (Front) Card */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.primaryLayer, frontCardStyle]}>
            {primary.photos && primary.photos.length > 0 ? (
              <>
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

                {/* Like Label */}
                <SwipeLabel
                  text="LIKE"
                  color="rgba(96, 165, 250, 1)"
                  shadowColor="rgba(96, 165, 250, 0.5)"
                  animatedStyle={likeLabelStyle}
                  position="left"
                />

                {/* Dislike Label */}
                <SwipeLabel
                  text="NOPE"
                  color="rgba(248, 113, 113, 1)"
                  shadowColor="rgba(248, 113, 113, 0.5)"
                  animatedStyle={dislikeLabelStyle}
                  position="right"
                />
              </>
            ) : (
              <EmptyFeedCard />
            )}
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
    // Fondo opaco para evitar que se vea la carta de atrás en frames intermedios
    backgroundColor: "rgb(10, 16, 28)",
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  likeTint: {
    backgroundColor: "rgba(96, 165, 250, 0.15)",
  },
  dislikeTint: {
    backgroundColor: "rgba(248, 113, 113, 0.1)", // More subtle red
  },
});
