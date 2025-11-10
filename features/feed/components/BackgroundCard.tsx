import React, { memo, useMemo, useRef } from "react";
import { ImageBackground, StyleSheet, useWindowDimensions, Animated } from "react-native";
import { BlurView } from "expo-blur";

import { PrimaryCard, PrimaryCardProps } from "./PrimaryCard";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useSwipeTint } from "../hooks/useSwipeTint"; // 👈 importá tu hook acá

type BackgroundCardProps = Pick<
  PrimaryCardProps,
  "photos" | "locationStrings" | "locationWidth" | "headline" | "budget" | "basicInfo"
> & {
  swipeX?: Animated.Value;
  screenWidth?: number;
  thresholdRatio?: number;
  /** 0..1 cuando la carta de atrás toma protagonismo */
  revealProgress?: Animated.Value;
};

function BackgroundCardComponent({
  photos,
  swipeX,
  screenWidth,
  thresholdRatio = 0.25,
  revealProgress,
  ...cardProps
}: BackgroundCardProps) {
  const backgroundPhoto = photos[0];
  const { height: winH, width: winW } = useWindowDimensions();
  const width = screenWidth ?? winW;

  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  // 🌀 Hook del tinte dinámico
  const { likeStyle, dislikeStyle, likeOpacity, dislikeOpacity } = useSwipeTint({
    swipeX: swipeX ?? new Animated.Value(0),
    screenWidth: width,
    thresholdRatio,
    likeColor: "#2EA3F2",
    dislikeColor: "#e01f1f",
    maxLikeOpacity: 0.25,
    maxDislikeOpacity: 0.35,
  });

  const zeroFallback = useRef(new Animated.Value(0)).current;
  const revealDriver = revealProgress ?? zeroFallback;

  const dragPeek = useMemo(() => {
    if (!swipeX) return zeroFallback;
    return swipeX.interpolate({
      inputRange: [-width, -width * 0.45, 0, width * 0.45, width],
      outputRange: [0.5, 0.1, 0, 0.1, 0.5],
      extrapolate: "clamp",
    });
  }, [swipeX, width, zeroFallback]);

  const stackedProgress = useMemo(
    () => Animated.diffClamp(Animated.add(revealDriver, dragPeek), 0, 1),
    [dragPeek, revealDriver],
  );

  const overlayOpacity = useMemo(
    () => Animated.diffClamp(Animated.subtract(1, Animated.add(revealDriver, dragPeek)), 0, 1),
    [dragPeek, revealDriver],
  );

  const translateY = useMemo(
    () =>
      stackedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 0],
      }),
    [stackedProgress],
  );

  const scale = useMemo(
    () =>
      stackedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
      }),
    [stackedProgress],
  );

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        styles.animatedContainer,
        {
          height: cardHeight,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <ImageBackground
        source={{ uri: backgroundPhoto }}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, styles.wrapper]}
      >
        <PrimaryCard
          {...cardProps}
          photos={photos}
          enableSwipe={false}
          showScrollCue={false}
          enableLocationToggle={false}
        />

        {/* Blur del fondo */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { opacity: overlayOpacity }]}>
          <BlurView
            pointerEvents="none"
            tint="systemUltraThinMaterialDark"
            intensity={40}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Tinte según swipe */}
        <Animated.View
          pointerEvents="none"
          style={[likeStyle, { opacity: Animated.multiply(likeOpacity, overlayOpacity) }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[dislikeStyle, { opacity: Animated.multiply(dislikeOpacity, overlayOpacity) }]}
        />

        {/* Capa oscura final */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.tintOverlay, { opacity: overlayOpacity }]}
        />
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    shadowOpacity: 0.14,
    elevation: 12,
  },
  wrapper: {
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  tintOverlay: {
    backgroundColor: "rgba(4, 10, 22, 0.45)",
  },
});

export const BackgroundCard = memo(BackgroundCardComponent);
