import React, { memo } from "react";
import { ImageBackground, StyleSheet, View, useWindowDimensions, Animated } from "react-native";
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
};

function BackgroundCardComponent({
  photos,
  swipeX,
  screenWidth,
  thresholdRatio = 0.25,
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

  return (
    <ImageBackground
      source={{ uri: backgroundPhoto }}
      resizeMode="cover"
      style={[StyleSheet.absoluteFillObject, styles.wrapper, { height: cardHeight }]}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <PrimaryCard
          {...cardProps}
          photos={photos}
          enableSwipe={false}
          showScrollCue={false}
          enableLocationToggle={false}
        />

        {/* Blur del fondo */}
        <BlurView
          pointerEvents="none"
          tint="systemUltraThinMaterialDark"
          intensity={40}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Tinte según swipe */}
        <Animated.View pointerEvents="none" style={likeStyle} />
        <Animated.View pointerEvents="none" style={dislikeStyle} />

        {/* Capa oscura final */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.tintOverlay]} />
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
