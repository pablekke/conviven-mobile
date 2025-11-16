import { useRef, useState } from "react";
import { Animated } from "react-native";

import { useSwipeTint } from "./useSwipeTint";

interface UseDeckSwipeTintResult {
  likeStyle: Animated.WithAnimatedObject<Animated.AnimatedProps<any>>;
  dislikeStyle: Animated.WithAnimatedObject<Animated.AnimatedProps<any>>;
  setDriver: (driver: Animated.Value | null) => void;
  reset: () => void;
}

export function useDeckSwipeTint(screenWidth: number): UseDeckSwipeTintResult {
  const fallbackRef = useRef(new Animated.Value(0));
  const [driver, setDriverState] = useState<Animated.Value | null>(null);

  const swipeValue = driver ?? fallbackRef.current;

  const { likeStyle, dislikeStyle } = useSwipeTint({
    swipeX: swipeValue,
    screenWidth,
    thresholdRatio: 0.25,
    likeColor: "#2EA3F2",
    dislikeColor: "#e01f1f",
    disabled: driver == null,
  });

  const setDriver = (value: Animated.Value | null) => {
    setDriverState(prev => (prev === value ? prev : value));
  };

  const reset = () => {
    setDriverState(null);
  };

  return { likeStyle, dislikeStyle, setDriver, reset };
}
