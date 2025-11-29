import {
  useSharedValue,
  useAnimatedStyle,
  AnimatedRef,
  measure,
  runOnJS,
  withSpring,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

interface UseDraggablePhotoProps {
  dropZoneRef: AnimatedRef<any>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
  onHoverChange: (isOver: boolean) => void;
  photoId: string;
}

export const useDraggablePhoto = ({
  dropZoneRef,
  onDragStart,
  onDragEnd,
  onDrop,
  onHoverChange,
  photoId,
}: UseDraggablePhotoProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(onDragStart)(photoId);
      scale.value = withSpring(1.1);
      opacity.value = withSpring(0.8);
    })
    .onUpdate(event => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;

      if (event.absoluteX !== undefined && event.absoluteY !== undefined) {
        const measured = measure(dropZoneRef);
        if (measured) {
          const isOver =
            event.absoluteX >= measured.pageX &&
            event.absoluteX <= measured.pageX + measured.width &&
            event.absoluteY >= measured.pageY &&
            event.absoluteY <= measured.pageY + measured.height;
          runOnJS(onHoverChange)(isOver);
        }
      }
    })
    .onEnd(event => {
      let isOver = false;

      if (event.absoluteX !== undefined && event.absoluteY !== undefined) {
        const measured = measure(dropZoneRef);
        if (measured) {
          isOver =
            event.absoluteX >= measured.pageX &&
            event.absoluteX <= measured.pageX + measured.width &&
            event.absoluteY >= measured.pageY &&
            event.absoluteY <= measured.pageY + measured.height;
        }
      }

      if (isOver) {
        runOnJS(onDrop)(photoId);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      runOnJS(onDragEnd)();
      runOnJS(onHoverChange)(false);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = scale.value > 1;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isActive ? 1000 : 1,
    };
  });

  return {
    panGesture,
    animatedStyle,
  };
};
