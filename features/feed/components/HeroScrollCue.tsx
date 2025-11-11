import { memo } from "react";
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from "react-native";
import Animated, { AnimatedStyleProp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

type HeroScrollCueProps = {
  translateStyle: AnimatedStyleProp<ViewStyle>;
  onPress: () => void;
  accessibilityLabel?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

function HeroScrollCueComponent({
  translateStyle,
  onPress,
  accessibilityLabel = "Deslizar hacia abajo",
  label = "Deslizar",
  style,
}: HeroScrollCueProps) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress} style={[styles.container, style]}>
      <Animated.View style={[styles.content, translateStyle]}>
        <Feather name="chevron-down" size={28} color="#ffffff" />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export const HeroScrollCue = memo(HeroScrollCueComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "400",
    textTransform: "uppercase",
    opacity: 0.9,
    marginTop: 4,
  },
});

export default HeroScrollCue;
