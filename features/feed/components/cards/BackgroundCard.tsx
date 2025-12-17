import Animated, { useAnimatedStyle, SharedValue } from "react-native-reanimated";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { FEED_CONSTANTS } from "../../constants/feed.constants";
import { Image as ExpoImage } from "expo-image";
import type { PrimaryCardProps } from "./types";
import { PrimaryCard } from "./PrimaryCard";
import { BlurView } from "expo-blur";
import { memo } from "react";

type BackgroundCardProps = Pick<
  PrimaryCardProps,
  | "photos"
  | "locationStrings"
  | "locationWidth"
  | "headline"
  | "budget"
  | "basicInfo"
  | "enableLocationToggle"
  | "showScrollCue"
> & {
  blurEnabled?: boolean;
  blurProgress?: SharedValue<number>;
};

function BackgroundCardComponent({
  photos,
  blurEnabled = true,
  blurProgress,
  enableLocationToggle = false,
  showScrollCue = false,
  ...cardProps
}: BackgroundCardProps) {
  const backgroundPhoto = photos[0];
  const { height: winH } = useWindowDimensions();

  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const computedHeroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const cardHeight = Math.max(
    0,
    computedHeroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA,
  );

  const blurStyle = useAnimatedStyle(() => {
    return {
      opacity: blurEnabled ? (blurProgress?.value ?? 1) : 0,
    };
  });

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.wrapper, { height: cardHeight }]}>
      {backgroundPhoto ? (
        <ExpoImage
          source={{ uri: backgroundPhoto }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={backgroundPhoto}
          transition={0}
        />
      ) : null}

      <View style={StyleSheet.absoluteFillObject}>
        <PrimaryCard
          {...cardProps}
          photos={photos}
          showScrollCue={showScrollCue}
          enableLocationToggle={enableLocationToggle}
        />

        {blurEnabled ? (
          <>
            {/* Blur del fondo */}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, blurStyle]}>
              <BlurView
                pointerEvents="none"
                tint="systemUltraThinMaterialDark"
                intensity={40}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>

            {/* Capa oscura final */}
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, styles.tintOverlay, blurStyle]}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderRadius: 24,
  },
  tintOverlay: {
    backgroundColor: "rgba(4, 10, 22, 0.2)",
  },
});

export const BackgroundCard = memo(BackgroundCardComponent);
