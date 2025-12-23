import { Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";

export function useScrollCueAnimation(showScrollCue: boolean) {
  const arrowTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showScrollCue) return;

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslate, {
          toValue: 8,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslate, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    bounce.start();

    // No reseteamos el valor a 0 en el cleanup para evitar saltos visuales si el componente se desmonta/remonta rápidamente
    return () => {
      bounce.stop();
    };
  }, [arrowTranslate, showScrollCue]);

  return arrowTranslate;
}
