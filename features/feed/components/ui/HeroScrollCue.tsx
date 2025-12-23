import { useTheme } from "../../../../context/ThemeContext";
import { memo, useRef, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";

type HeroScrollCueProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  rotated?: boolean;
};

function HeroScrollCueComponent({
  onPress,
  accessibilityLabel = "Deslizar hacia abajo",
  style,
  rotated = false,
}: HeroScrollCueProps) {
  const { colors } = useTheme();

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 10,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startAnimation();
  }, []);

  const rotationAnim = useRef(new Animated.Value(rotated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: rotated ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [rotated]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const shadow = Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 6,
    },
  });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.container, style]}
      hitSlop={8}
    >
      <Animated.View style={[styles.content, { transform: [{ translateY: bounceAnim }] }]}>
        <Animated.View
          style={[
            styles.iconWrapper,
            shadow,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              backgroundColor: colors.primary,
              borderColor: "rgba(255, 255, 255, 0.2)",
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <Feather name="chevron-down" size={24} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export const HeroScrollCue = memo(HeroScrollCueComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
});

export default HeroScrollCue;
