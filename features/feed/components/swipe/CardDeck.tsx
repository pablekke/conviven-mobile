import { FEED_CONSTANTS, computeHeroImageHeight } from "../../constants/feed.constants";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { FeedScrollContext } from "../../context/ScrollContext";
import { useSwipeAnimations } from "./hooks/useSwipeAnimations";
import { GestureDetector } from "react-native-gesture-handler";
import { useCardDeckState } from "./hooks/useCardDeckState";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import { BackgroundCard } from "../cards/BackgroundCard";
import { EmptyFeedCard } from "../cards/EmptyFeedCard";
import { PrimaryCard } from "../cards/PrimaryCard";
import type { CardDeckProps } from "../../types";
import { SwipeLabel } from "./SwipeLabel";
import { memo, useCallback } from "react";
import { BlurView } from "expo-blur";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function CardDeckComponent({
  scrollRef,
  className = "relative w-[96%] mx-auto",
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

  const { isSwipeLocked, setIsSwipeLocked, prefetchSecondary, unlockSwipe } = useCardDeckState(
    primary,
    secondary,
    translationX,
    translationY,
  );

  const { onSwipeComplete } = primary;

  const handleSwipeComplete = useCallback(
    (direction: "like" | "dislike") => {
      if (onSwipeComplete) {
        onSwipeComplete(direction);
      }
      unlockSwipe();
    },
    [onSwipeComplete, unlockSwipe],
  );

  const panGesture = useSwipeGesture({
    translationX,
    isSwipeLocked,
    setIsSwipeLocked,
    onSwipeComplete: handleSwipeComplete,
    prefetchSecondary,
  });

  const {
    frontCardStyle,
    likeTintStyle,
    dislikeTintStyle,
    likeLabelStyle,
    dislikeLabelStyle,
    backCardStyle,
    blurProps,
  } = useSwipeAnimations({ translationX });

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
    borderRadius: 24,
    overflow: "hidden",
  },
  primaryLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    borderRadius: 24,
  },
  likeTint: {
    backgroundColor: "rgba(96, 165, 250, 0.15)",
  },
  dislikeTint: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
});
