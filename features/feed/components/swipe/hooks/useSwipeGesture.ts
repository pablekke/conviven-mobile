import { runOnJS, withTiming } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface UseSwipeGestureProps {
  translationX: { value: number };
  isSwipeLocked: boolean;
  setIsSwipeLocked: (locked: boolean) => void;
  onSwipeComplete: (direction: "like" | "dislike") => void;
  prefetchSecondary: () => void;
}

export function useSwipeGesture({
  translationX,
  isSwipeLocked,
  setIsSwipeLocked,
  onSwipeComplete,
  prefetchSecondary,
}: UseSwipeGestureProps) {
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate(event => {
      if (isSwipeLocked) return;
      translationX.value = event.translationX;
    })
    .onEnd(event => {
      if (isSwipeLocked) return;
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "like" : "dislike";
        const targetX = direction === "like" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        runOnJS(prefetchSecondary)();
        runOnJS(setIsSwipeLocked)(true);

        translationX.value = withTiming(targetX, { duration: 700 }, finished => {
          if (finished) {
            runOnJS(onSwipeComplete)(direction);
          }
        });
      } else {
        translationX.value = withTiming(0, { duration: 320 });
      }
    });

  return panGesture;
}

