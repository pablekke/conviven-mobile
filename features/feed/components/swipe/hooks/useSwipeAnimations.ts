import { Dimensions } from "react-native";
import {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  Extrapolation,
  interpolate,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ROTATION_DEG = 15;

interface UseSwipeAnimationsProps {
  translationX: { value: number };
}

export function useSwipeAnimations({ translationX }: UseSwipeAnimationsProps) {
  const rotate = useDerivedValue(() => {
    return interpolate(
      translationX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-ROTATION_DEG, 0, ROTATION_DEG],
      Extrapolation.CLAMP,
    );
  });

  const likeOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 4], [0, 1], Extrapolation.CLAMP);
  });

  const dislikeOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 4, 0], [1, 0], Extrapolation.CLAMP);
  });

  const likeLabelOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 6], [0, 1], Extrapolation.CLAMP);
  });

  const dislikeLabelOpacity = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 6, 0], [1, 0], Extrapolation.CLAMP);
  });

  const likeLabelScale = useDerivedValue(() => {
    return interpolate(translationX.value, [0, SCREEN_WIDTH / 4], [0.8, 1], Extrapolation.CLAMP);
  });

  const dislikeLabelScale = useDerivedValue(() => {
    return interpolate(translationX.value, [-SCREEN_WIDTH / 4, 0], [1, 0.8], Extrapolation.CLAMP);
  });

  const nextCardScale = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH],
      [0.95, 1],
      Extrapolation.CLAMP,
    );
  });

  const blurIntensity = useDerivedValue(() => {
    return interpolate(
      Math.abs(translationX.value),
      [0, SCREEN_WIDTH],
      [60, 0],
      Extrapolation.CLAMP,
    );
  });

  const blurProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
  });

  const frontCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }, { rotate: `${rotate.value}deg` }],
  }));

  const likeTintStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const dislikeTintStyle = useAnimatedStyle(() => ({
    opacity: dislikeOpacity.value,
  }));

  const likeLabelStyle = useAnimatedStyle(() => ({
    opacity: likeLabelOpacity.value,
    transform: [{ scale: likeLabelScale.value }],
  }));

  const dislikeLabelStyle = useAnimatedStyle(() => ({
    opacity: dislikeLabelOpacity.value,
    transform: [{ scale: dislikeLabelScale.value }],
  }));

  const backCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
  }));

  return {
    frontCardStyle,
    likeTintStyle,
    dislikeTintStyle,
    likeLabelStyle,
    dislikeLabelStyle,
    backCardStyle,
    blurProps,
  };
}
