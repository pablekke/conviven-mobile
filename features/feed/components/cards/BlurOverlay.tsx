import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { FEED_CONSTANTS } from "../../constants/feed.constants";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { memo } from "react";

interface BlurOverlayProps {
  cardHeight: number;
  style?: StyleProp<ViewStyle>;
}

export const BlurOverlay = memo(({ cardHeight, style }: BlurOverlayProps) => {
  const blurHeight = Math.min(cardHeight * 0.65, FEED_CONSTANTS.HERO_BLUR_MAX_HEIGHT);
  const top = Math.max(0, cardHeight - (blurHeight + FEED_CONSTANTS.HERO_BLUR_OVERHANG));

  return (
    <View
      pointerEvents="none"
      style={[
        styles.blurOverlay,
        { top, height: blurHeight + FEED_CONSTANTS.HERO_BLUR_OVERHANG },
        style,
      ]}
    >
      <MaskedView
        style={StyleSheet.absoluteFillObject}
        maskElement={
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)", "rgba(0,0,0,1)"]}
            locations={[0, 0.3, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        }
      >
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
      </MaskedView>
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.24)"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
});

BlurOverlay.displayName = "BlurOverlay";

const styles = StyleSheet.create({
  blurOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    overflow: "hidden",
  },
});
