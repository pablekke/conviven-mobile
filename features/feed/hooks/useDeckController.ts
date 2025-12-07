import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

type Dir = "like" | "dislike";

export function useDeckController<T>(items: readonly T[]) {
  const [index, setIndex] = useState(0);

  // Proveer current / next circularmente
  const current = useMemo(() => items[index % items.length], [index, items]);
  const next = useMemo(() => items[(index + 1) % items.length], [index, items]);
  const nextNext = useMemo(() => items[(index + 2) % items.length], [index, items]);

  // Animaciones para "background" (la que va atrás, que se revelará)
  const nextScale = useRef(new Animated.Value(0.96)).current;
  const nextTranslateY = useRef(new Animated.Value(16)).current;
  const nextOpacity = useRef(new Animated.Value(1)).current; // visible pero blur/tinte ON
  const revealProgress = useRef(new Animated.Value(0)).current; // 0 = blur/tinte, 1 = limpio

  const isTransitioningRef = useRef(false);

  const prepareNext = useCallback(() => {
    // Deja la capa next en posición detrás, sutilmente más chica/abajo
    nextScale.setValue(0.96);
    nextTranslateY.setValue(16);
    nextOpacity.setValue(1);
    revealProgress.setValue(0);
  }, [nextOpacity, nextScale, nextTranslateY, revealProgress]);

  const playPromote = useCallback(
    (onEnd?: () => void) => {
      // Promueve la "next": le quita blur/tinte y la lleva a escala/posición final
      Animated.parallel([
        Animated.timing(nextScale, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(nextTranslateY, {
          toValue: 0,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(revealProgress, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // usamos para opacidades y props no transform
        }),
      ]).start(() => {
        onEnd?.();
      });
    },
    [nextScale, nextTranslateY, revealProgress],
  );

  const onTopSwiped = useCallback(
    (_: Dir, afterSwap?: () => void) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      // Promueve la background
      playPromote(() => {
        // Intercambiamos índices: la que estaba atrás pasa a ser current
        setIndex(i => i + 1);

        // Inmediatamente preparamos la nueva background (next-next)
        prepareNext();

        isTransitioningRef.current = false;
        afterSwap?.();
      });
    },
    [playPromote, prepareNext],
  );

  // Estilo animado para la capa next (debajo de la top)
  const nextAnimatedStyle = useMemo(
    () => ({
      transform: [{ scale: nextScale }, { translateY: nextTranslateY }],
      opacity: nextOpacity,
    }),
    [nextOpacity, nextScale, nextTranslateY],
  );

  return {
    index,
    current,
    next,
    nextNext,
    // flags & handlers
    isTransitioningRef,
    onTopSwiped,
    // anim
    revealProgress,
    nextAnimatedStyle,
    prepareNext,
  };
}
