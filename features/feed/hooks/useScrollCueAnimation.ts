import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function useScrollCueAnimation(showScrollCue: boolean) {
  const arrowTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showScrollCue) return;

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslate, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    bounce.start();
    return () => {
      bounce.stop();
      arrowTranslate.setValue(0);
    };
  }, [arrowTranslate, showScrollCue]);

  return arrowTranslate;
}
