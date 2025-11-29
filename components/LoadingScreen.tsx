import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";

import Spinner from "./Spinner";
import { useTheme } from "../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LoadingScreenProps {
  onAnimationComplete?: () => void;
  shouldSlideOut?: boolean;
}

export default function LoadingScreen({
  onAnimationComplete,
  shouldSlideOut = false,
}: LoadingScreenProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldSlideOut) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [shouldSlideOut, slideAnim, onAnimationComplete]);

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={[
        styles.fullScreen,
        { backgroundColor: colors.conviven.blue },
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Spinner size={52} color="#FFFFFF" trackColor="rgba(255,255,255,0.15)" thickness={5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
