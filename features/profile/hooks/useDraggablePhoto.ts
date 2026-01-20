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
  photoDropZoneRefs?: AnimatedRef<any>[];
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string, targetIndex: number | null) => void;
  onHoverChange: (isOver: boolean) => void;
  onPhotoHoverChange?: (photoId: string | null) => void;
  photoId: string;
  photoIndex?: number;
}

export const useDraggablePhoto = ({
  dropZoneRef,
  photoDropZoneRefs = [],
  onDragStart,
  onDragEnd,
  onDrop,
  onHoverChange,
  onPhotoHoverChange,
  photoId,
  photoIndex,
}: UseDraggablePhotoProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const checkDropZones = (absoluteX: number, absoluteY: number) => {
    "worklet";
    const measured = measure(dropZoneRef);
    if (measured) {
      const isOverPrimary =
        absoluteX >= measured.pageX &&
        absoluteX <= measured.pageX + measured.width &&
        absoluteY >= measured.pageY &&
        absoluteY <= measured.pageY + measured.height;

      if (isOverPrimary) {
        runOnJS(onHoverChange)(true);
        if (onPhotoHoverChange) {
          runOnJS(onPhotoHoverChange)(null);
        }
        return { isOverPrimary: true, hoveredPhotoIndex: null };
      }
    }

    for (let i = 0; i < photoDropZoneRefs.length; i++) {
      if (i === photoIndex) continue;

      const photoMeasured = measure(photoDropZoneRefs[i]);
      if (photoMeasured) {
        const isOverPhoto =
          absoluteX >= photoMeasured.pageX &&
          absoluteX <= photoMeasured.pageX + photoMeasured.width &&
          absoluteY >= photoMeasured.pageY &&
          absoluteY <= photoMeasured.pageY + photoMeasured.height;

        if (isOverPhoto) {
          runOnJS(onHoverChange)(false);
          if (onPhotoHoverChange) {
            runOnJS(onPhotoHoverChange)(`photo-${i}`);
          }
          return { isOverPrimary: false, hoveredPhotoIndex: i };
        }
      }
    }

    runOnJS(onHoverChange)(false);
    if (onPhotoHoverChange) {
      runOnJS(onPhotoHoverChange)(null);
    }
    return { isOverPrimary: false, hoveredPhotoIndex: null };
  };

  const panGesture = Gesture.Pan()
    .minDistance(5) 
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;

      runOnJS(onDragStart)(photoId);
      scale.value = withSpring(1.2, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(0.9);
    })
    .onUpdate(event => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;

      if (event.absoluteX !== undefined && event.absoluteY !== undefined) {
        checkDropZones(event.absoluteX, event.absoluteY);
      }
    })
    .onEnd(event => {
      let dropResult = { isOverPrimary: false, hoveredPhotoIndex: null as number | null };

      if (event.absoluteX !== undefined && event.absoluteY !== undefined) {
        dropResult = checkDropZones(event.absoluteX, event.absoluteY);
      }

      if (dropResult.isOverPrimary || dropResult.hoveredPhotoIndex !== null) {
        runOnJS(onDrop)(photoId, dropResult.hoveredPhotoIndex);
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      runOnJS(onDragEnd)();
      runOnJS(onHoverChange)(false);
      if (onPhotoHoverChange) {
        runOnJS(onPhotoHoverChange)(null);
      }
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
