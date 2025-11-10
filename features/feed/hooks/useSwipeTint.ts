import { useMemo } from "react";
import {
  Animated,
  useWindowDimensions,
  StyleSheet,
  type ViewStyle,
} from "react-native";

type AnimatedStyle = Animated.WithAnimatedObject<ViewStyle>;

interface UseSwipeTintOptions {
  swipeX: Animated.Value;
  screenWidth?: number;
  thresholdRatio?: number;
  likeColor?: string;
  dislikeColor?: string;
  maxLikeOpacity?: number;
  maxDislikeOpacity?: number;
  disabled?: boolean;
}

interface UseSwipeTintResult {
  likeStyle: AnimatedStyle;
  dislikeStyle: AnimatedStyle;
  likeOpacity: Animated.AnimatedInterpolation<number>;
  dislikeOpacity: Animated.AnimatedInterpolation<number>;
}

export function useSwipeTint({
  swipeX,
  screenWidth,
  thresholdRatio = 0.25,
  likeColor = "#2EA3F2",
  dislikeColor = "#e01f1f",
  maxLikeOpacity = 0.30,
  maxDislikeOpacity = 0.6,
  disabled = false,
}: UseSwipeTintOptions): UseSwipeTintResult {
  const { width: winW } = useWindowDimensions();
  const width = screenWidth ?? winW;

  const likeThreshold = width * thresholdRatio;

  const likeOpacity = useMemo(() => {
    if (disabled) return new Animated.Value(0) as unknown as Animated.AnimatedInterpolation<number>;
    return swipeX.interpolate({
      inputRange: [0, likeThreshold, width],
      outputRange: [0, maxLikeOpacity * 0.5, maxLikeOpacity],
      extrapolate: "clamp",
    });
  }, [disabled, likeThreshold, maxLikeOpacity, swipeX, width]);

  const dislikeOpacity = useMemo(() => {
    if (disabled) return new Animated.Value(0) as unknown as Animated.AnimatedInterpolation<number>;
    return swipeX.interpolate({
      inputRange: [-width, -likeThreshold, 0],
      outputRange: [maxDislikeOpacity, maxDislikeOpacity * 0.5, 0],
      extrapolate: "clamp",
    });
  }, [disabled, likeThreshold, maxDislikeOpacity, swipeX, width]);

  const likeStyle: AnimatedStyle = useMemo(
    () => ({
      ...StyleSheet.absoluteFillObject,
      backgroundColor: likeColor,
      opacity: likeOpacity,
    }),
    [likeColor, likeOpacity]
  );

  const dislikeStyle: AnimatedStyle = useMemo(
    () => ({
      ...StyleSheet.absoluteFillObject,
      backgroundColor: dislikeColor,
      opacity: dislikeOpacity,
    }),
    [dislikeColor, dislikeOpacity]
  );

  return { likeStyle, dislikeStyle, likeOpacity, dislikeOpacity };
}