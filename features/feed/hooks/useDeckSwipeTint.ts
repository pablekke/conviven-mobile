import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { useSwipeTint } from "./useSwipeTint";

interface UseDeckSwipeTintResult {
  likeStyle: Animated.WithAnimatedObject<Animated.AnimatedProps<any>>;
  dislikeStyle: Animated.WithAnimatedObject<Animated.AnimatedProps<any>>;
  setDriver: (driver: Animated.Value | null) => void;
  reset: (delay?: number) => void;
}

const FADE_OUT_DURATION = 220;

export function useDeckSwipeTint(screenWidth: number): UseDeckSwipeTintResult {
  const fallbackRef = useRef(new Animated.Value(0));
  const [driver, setDriverState] = useState<Animated.Value | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenerRef = useRef<string | null>(null);
  const lastValueRef = useRef(0);

  const swipeValue = driver ?? fallbackRef.current;

  const { likeStyle, dislikeStyle } = useSwipeTint({
    swipeX: swipeValue,
    screenWidth,
    thresholdRatio: 0.25,
    likeColor: "#2EA3F2",
    dislikeColor: "#e01f1f",
  });

  useEffect(() => {
    if (!driver) {
      if (listenerRef.current) {
        fallbackRef.current.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      return;
    }

    if (listenerRef.current) {
      fallbackRef.current.removeListener(listenerRef.current);
      listenerRef.current = null;
    }

    listenerRef.current = driver.addListener(({ value }) => {
      lastValueRef.current = value;
      fallbackRef.current.setValue(value);
    });

    return () => {
      if (listenerRef.current) {
        driver.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [driver]);

  const clearPendingReset = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  const setDriver = (value: Animated.Value | null) => {
    clearPendingReset();
    setDriverState(prev => (prev === value ? prev : value));
    if (value) {
      lastValueRef.current = 0;
      fallbackRef.current.setValue(0);
    }
  };

  const startFadeOut = () => {
    const initial = lastValueRef.current;
    fallbackRef.current.setValue(initial);
    setDriverState(null);
    Animated.timing(fallbackRef.current, {
      toValue: 0,
      duration: FADE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      fallbackRef.current.setValue(0);
      lastValueRef.current = 0;
    });
  };

  const reset = (delay = 0) => {
    clearPendingReset();
    if (delay > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        startFadeOut();
      }, delay);
    } else {
      startFadeOut();
    }
  };

  useEffect(
    () => () => {
      clearPendingReset();
      if (listenerRef.current && driver) {
        driver.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    },
    [driver],
  );

  return { likeStyle, dislikeStyle, setDriver, reset };
}
