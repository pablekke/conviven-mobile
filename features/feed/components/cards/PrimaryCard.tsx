import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import { FEED_CONSTANTS } from "../../constants/feed.constants";
import { PhotoGalleryButton } from "./PhotoGalleryButton";
import type { PrimaryCardProps } from "./types";
import { BlurOverlay } from "./BlurOverlay";
import { CardCallout } from "./CardCallout";
import { HeroImage } from "./HeroImage";
import { memo } from "react";

function PrimaryCardComponent({
  photos,
  headline,
  budget,
  basicInfo,
  blurOverlayStyle,
  style,
  photosCount,
  onPhotosPress,
}: PrimaryCardProps) {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );
  const mainPhoto = photos?.[0];

  return (
    <Animated.View style={[styles.cardContainer, { height: cardHeight }, style]}>
      <HeroImage photo={mainPhoto ?? ""} height={cardHeight} />

      <BlurOverlay cardHeight={cardHeight} style={blurOverlayStyle} />

      <View style={styles.contentOverlay} pointerEvents="box-none">
        <CardCallout headline={headline} budget={budget} basicInfo={basicInfo} />
      </View>

      {photosCount !== undefined && photosCount > 0 && onPhotosPress && (
        <View style={styles.photoButtonContainer} pointerEvents="box-none">
          <PhotoGalleryButton photosCount={photosCount} onPress={onPhotosPress} />
        </View>
      )}
    </Animated.View>
  );
}

export const PrimaryCard = memo(PrimaryCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingBottom: 5,
    zIndex: 100,
  },
  photoButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 101,
  },
});
