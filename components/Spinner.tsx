import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type SpinnerProps = {
  size?: number;
  color?: string;
  trackColor?: string;
  thickness?: number;
  style?: ViewStyle;
  durationMs?: number;
};

export default function Spinner({
  size = 48,
  color = "#FFFFFF",
  trackColor = "rgba(255,255,255,0.25)",
  thickness = 4,
  style,
  durationMs = 900,
}: SpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      rotation.stopAnimation();
    };
  }, [durationMs, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const borderRadius = size / 2;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          borderWidth: thickness,
          borderColor: trackColor,
          borderLeftColor: color,
          transform: [{ rotate: rotateInterpolate }],
        },
        style,
      ]}
    />
  );
}
