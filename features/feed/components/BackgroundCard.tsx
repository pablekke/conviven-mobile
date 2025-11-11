import { memo, useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, type AnimatedStyleProp, type SharedValue } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { PrimaryCard } from "./PrimaryCard";
import type { ProfileDeckItem } from "../utils/createProfileCardData";

type DeckCardData = ProfileDeckItem["primary"];

type BackgroundCardProps = {
  data: DeckCardData;
  heroHeight: number;
  pointerEvents: "auto" | "none";
  cardStyle: AnimatedStyleProp<ViewStyle>;
  blurOpacity: SharedValue<number>;
  likeStyle?: AnimatedStyleProp<ViewStyle>;
  dislikeStyle?: AnimatedStyleProp<ViewStyle>;
  locationWidth?: number;
  enableLocationToggle: boolean;
};

function BackgroundCardComponent({
  data,
  heroHeight,
  pointerEvents,
  cardStyle,
  blurOpacity,
  likeStyle,
  dislikeStyle,
  locationWidth,
  enableLocationToggle,
}: BackgroundCardProps) {
  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const staticCardProps = useMemo(
    () => ({
      photos: [...data.photos],
      locationStrings: [...data.locationStrings],
      headline: data.headline,
      budget: data.budget,
      basicInfo: [...data.basicInfo],
    }),
    [data],
  );

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[styles.card, { height: heroHeight }, cardStyle]}
    >
      <PrimaryCard
        {...staticCardProps}
        locationWidth={locationWidth}
        enableSwipe={false}
        enableLocationToggle={enableLocationToggle}
        showScrollCue={enableLocationToggle}
      />

      <Animated.View pointerEvents="none" style={[styles.blurOverlay, blurStyle]}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.blurGradient} />
      </Animated.View>

      {likeStyle ? <Animated.View pointerEvents="none" style={[styles.tint, likeStyle]} /> : null}
      {dislikeStyle ? (
        <Animated.View pointerEvents="none" style={[styles.tint, dislikeStyle]} />
      ) : null}

      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.shadow]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  blurGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 10, 22, 0.38)",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  shadow: {
    backgroundColor: "rgba(4, 10, 22, 0.32)",
  },
});

export const BackgroundCard = memo(BackgroundCardComponent);
