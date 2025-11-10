import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";

type SwipeDirection = "like" | "dislike";

interface UseSwipeCardOptions {
  screenWidth: number;
  onComplete?: (direction: SwipeDirection) => void;
  thresholdRatio?: number;
  disabled?: boolean;
}

export function useSwipeCard({
  screenWidth,
  onComplete,
  thresholdRatio = 0.25,
  disabled = false,
}: UseSwipeCardOptions) {
  const swipeX = useRef(new Animated.Value(0)).current;
  const [swipeActiveState, setSwipeActive] = useState(false);

  const likeThreshold = useMemo(() => screenWidth * thresholdRatio, [screenWidth, thresholdRatio]);

  const rotation = useMemo(() => {
    if (disabled) return "0deg";
    return swipeX.interpolate({
      inputRange: [-screenWidth, 0, screenWidth],
      outputRange: ["-12deg", "0deg", "12deg"],
    });
  }, [disabled, screenWidth, swipeX]);

  const cardStyle = useMemo(
    () => (disabled ? {} : { transform: [{ translateX: swipeX }, { rotate: rotation }] }),
    [disabled, rotation, swipeX],
  );

  const resetSwipe = useCallback(() => {
    if (disabled) return;
    Animated.spring(swipeX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start(() => {
      setSwipeActive(false);
    });
  }, [disabled, swipeX]);

  const completeSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (disabled) return;
      Animated.timing(swipeX, {
        toValue: direction === "like" ? screenWidth + 160 : -screenWidth - 160,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        onComplete?.(direction);
        swipeX.setValue(0);
        setSwipeActive(false);
      });
    },
    [disabled, onComplete, screenWidth, swipeX],
  );

  const panResponder = useMemo(() => {
    if (disabled) {
      return null;
    }
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        const { dx, dy } = gesture;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        setSwipeActive(true);
      },
      onPanResponderMove: Animated.event([null, { dx: swipeX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_evt, gesture) => {
        const { dx, vx } = gesture;
        if (dx > likeThreshold || (vx > 0.8 && dx > 40)) {
          completeSwipe("like");
        } else if (dx < -likeThreshold || (vx < -0.8 && dx < -40)) {
          completeSwipe("dislike");
        } else {
          resetSwipe();
        }
      },
      onPanResponderTerminate: () => {
        resetSwipe();
      },
    });
  }, [completeSwipe, disabled, likeThreshold, resetSwipe, swipeX]);

  return {
    swipeX,
    swipeActive: disabled ? false : swipeActiveState,
    cardStyle,
    panHandlers: panResponder ? panResponder.panHandlers : {},
  };
}
