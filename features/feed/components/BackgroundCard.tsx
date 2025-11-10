import { ImageBackground, StyleSheet, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { memo } from "react";

import { PrimaryCard, PrimaryCardProps } from "./PrimaryCard";
import { FEED_CONSTANTS } from "../constants/feed.constants";

type BackgroundCardProps = Pick<
  PrimaryCardProps,
  "photos" | "locationStrings" | "locationWidth" | "headline" | "budget" | "basicInfo"
>;

function BackgroundCardComponent(cardProps: BackgroundCardProps) {
  const { photos } = cardProps;
  const backgroundPhoto = photos[0];
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  return (
    <ImageBackground
      source={{ uri: backgroundPhoto }}
      resizeMode="cover"
      style={[StyleSheet.absoluteFillObject, styles.wrapper, { height: cardHeight }]}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <PrimaryCard
          {...cardProps}
          enableSwipe={false}
          showScrollCue={false}
          enableLocationToggle={false}
        />
        <BlurView
          pointerEvents="none"
          tint="systemUltraThinMaterialDark"
          intensity={40}
          style={StyleSheet.absoluteFillObject}
        />
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
