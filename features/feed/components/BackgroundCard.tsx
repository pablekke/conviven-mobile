import React, { memo } from "react";
import { Animated, ImageBackground, StyleSheet, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";

import { PrimaryCard, PrimaryCardProps } from "./PrimaryCard";
import { FEED_CONSTANTS } from "../constants/feed.constants";
import { useSwipeTint } from "../hooks/useSwipeTint";

type BackgroundCardProps = Pick<
  PrimaryCardProps,
  | "photos"
  | "locationStrings"
  | "locationWidth"
  | "headline"
  | "budget"
  | "basicInfo"
  | "onSwipeComplete"
  | "onSwipeXChange"
  | "enableSwipe"
  | "enableLocationToggle"
  | "showScrollCue"
> & {
  swipeX?: Animated.Value;
  screenWidth?: number;
  thresholdRatio?: number;
  blurEnabled?: boolean;
  blurProgress?: Animated.AnimatedInterpolation<number> | Animated.Value;
};

function BackgroundCardComponent({
  photos,
  swipeX,
  screenWidth,
  thresholdRatio = 0.25,
  blurEnabled = true,
  blurProgress,
  enableSwipe = false,
  enableLocationToggle = false,
  showScrollCue = false,
  onSwipeComplete,
  onSwipeXChange,
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
  const { likeStyle, dislikeStyle } = useSwipeTint({
    swipeX: swipeX ?? new Animated.Value(0),
    screenWidth: width,
    thresholdRatio,
    likeColor: "#2EA3F2",
    dislikeColor: "#e01f1f",
    maxLikeOpacity: 0.25,
    maxDislikeOpacity: 0.35,
  });

  const resolvedBlurOpacity = blurEnabled ? (blurProgress ?? 1) : 0;

  return (
    <ImageBackground
      key={backgroundPhoto}
      resizeMode="cover"
      style={[StyleSheet.absoluteFillObject, styles.wrapper, { height: cardHeight }]}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <PrimaryCard
          {...cardProps}
          photos={photos}
          enableSwipe={enableSwipe}
          showScrollCue={showScrollCue}
          enableLocationToggle={enableLocationToggle}
          onSwipeComplete={onSwipeComplete}
          onSwipeXChange={onSwipeXChange}
        />

        {blurEnabled ? (
          <>
            {/* Blur del fondo */}
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, { opacity: resolvedBlurOpacity }]}
            >
              <BlurView
                pointerEvents="none"
                tint="systemUltraThinMaterialDark"
                intensity={40}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>


          </>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
