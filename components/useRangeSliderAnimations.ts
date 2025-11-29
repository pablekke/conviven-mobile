import { useAnimatedStyle, SharedValue } from "react-native-reanimated";

interface UseRangeSliderAnimationsParams {
  minPosition: SharedValue<number>;
  maxPosition: SharedValue<number>;
}

export function useRangeSliderAnimations({
  minPosition,
  maxPosition,
}: UseRangeSliderAnimationsParams) {
  const minHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minPosition.value }],
  }));

  const maxHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxPosition.value }],
  }));

  const trackActiveStyle = useAnimatedStyle(() => {
    const left = minPosition.value;
    const width = maxPosition.value - minPosition.value;
    return {
      left,
      width,
      top: 17,
    };
  });

  return {
    minHandleStyle,
    maxHandleStyle,
    trackActiveStyle,
  };
}
