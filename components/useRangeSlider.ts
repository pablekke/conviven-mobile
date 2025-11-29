import { useCallback, useEffect, useMemo, useRef } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming, runOnJS, SharedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HANDLE_WIDTH = 28;
const HANDLE_RADIUS = HANDLE_WIDTH / 2;
const SLIDER_WIDTH = SCREEN_WIDTH - 72;
const TRACK_WIDTH = SLIDER_WIDTH - HANDLE_WIDTH;

interface UseRangeSliderParams {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onValueChange: (min: number, max: number) => void;
  step?: number;
}

interface UseRangeSliderReturn {
  minPosition: SharedValue<number>;
  maxPosition: SharedValue<number>;
  isDraggingMin: SharedValue<boolean>;
  isDraggingMax: SharedValue<boolean>;
  minGesture: ReturnType<typeof Gesture.Pan>;
  maxGesture: ReturnType<typeof Gesture.Pan>;
  SLIDER_WIDTH: number;
  TRACK_WIDTH: number;
  HANDLE_RADIUS: number;
  HANDLE_WIDTH: number;
}

export function useRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onValueChange,
  step = 1000,
}: UseRangeSliderParams): UseRangeSliderReturn {
  const range = max - min;

  // Calcular posiciones iniciales (considerando el radio del handle)
  const initialMinPos = useMemo(
    () => HANDLE_RADIUS + ((minValue - min) / range) * TRACK_WIDTH,
    [minValue, min, max, range],
  );
  const initialMaxPos = useMemo(
    () => HANDLE_RADIUS + ((maxValue - min) / range) * TRACK_WIDTH,
    [maxValue, min, max, range],
  );

  const minPosition = useSharedValue(initialMinPos);
  const maxPosition = useSharedValue(initialMaxPos);
  const isDraggingMin = useSharedValue(false);
  const isDraggingMax = useSharedValue(false);
  const minStartX = useSharedValue(0);
  const maxStartX = useSharedValue(0);

  // Valores compartidos para worklets
  const minSV = useSharedValue(min);
  const maxSV = useSharedValue(max);
  const rangeSV = useSharedValue(range);
  const stepSV = useSharedValue(step);
  const trackWidthSV = useSharedValue(TRACK_WIDTH);
  const handleRadiusSV = useSharedValue(HANDLE_RADIUS);

  // Actualizar valores compartidos cuando cambian
  useEffect(() => {
    minSV.value = min;
    maxSV.value = max;
    rangeSV.value = range;
    stepSV.value = step;
    trackWidthSV.value = TRACK_WIDTH;
    handleRadiusSV.value = HANDLE_RADIUS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, range, step]);

  // Actualizar posiciones cuando cambian los valores externos
  useEffect(() => {
    if (!isDraggingMin.value && !isDraggingMax.value) {
      const newMinPos = HANDLE_RADIUS + ((minValue - min) / range) * TRACK_WIDTH;
      const newMaxPos = HANDLE_RADIUS + ((maxValue - min) / range) * TRACK_WIDTH;
      minPosition.value = withTiming(newMinPos, { duration: 100 });
      maxPosition.value = withTiming(newMaxPos, { duration: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minValue, maxValue, min, max, range]);

  // Función worklet para convertir posición a valor
  const positionToValue = (position: number): number => {
    "worklet";
    const adjustedPosition = position - handleRadiusSV.value;
    const percentage = Math.max(0, Math.min(1, adjustedPosition / trackWidthSV.value));
    const value = minSV.value + percentage * rangeSV.value;
    return Math.round(value / stepSV.value) * stepSV.value;
  };

  // Función worklet para convertir valor a posición
  const valueToPosition = (value: number): number => {
    "worklet";
    const percentage = (value - minSV.value) / rangeSV.value;
    return handleRadiusSV.value + percentage * trackWidthSV.value;
  };

  const updateValues = useCallback(
    (newMin: number, newMax: number) => {
      onValueChange(newMin, newMax);
    },
    [onValueChange],
  );

  // Throttle para actualizaciones más fluidas
  const lastUpdateTime = useRef(0);
  const updateValuesThrottled = useCallback(
    (newMin: number, newMax: number) => {
      const now = Date.now();
      if (now - lastUpdateTime.current > 16) {
        // ~60fps
        lastUpdateTime.current = now;
        updateValues(newMin, newMax);
      }
    },
    [updateValues],
  );

  // Gesture para el handle mínimo (solo horizontal, previene scroll vertical)
  const minGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-15, 15])
    .onStart(() => {
      "worklet";
      isDraggingMin.value = true;
      minStartX.value = minPosition.value;
    })
    .onUpdate(event => {
      "worklet";
      const newPosition = Math.max(
        handleRadiusSV.value,
        Math.min(minStartX.value + event.translationX, maxPosition.value - HANDLE_WIDTH),
      );
      minPosition.value = newPosition;
      const newMin = positionToValue(newPosition);
      const currentMax = positionToValue(maxPosition.value);
      runOnJS(updateValuesThrottled)(
        Math.max(minSV.value, Math.min(newMin, currentMax - stepSV.value)),
        currentMax,
      );
    })
    .onEnd(() => {
      "worklet";
      isDraggingMin.value = false;
      const finalMin = Math.max(
        minSV.value,
        Math.min(
          positionToValue(minPosition.value),
          positionToValue(maxPosition.value) - stepSV.value,
        ),
      );
      const finalMax = positionToValue(maxPosition.value);
      minPosition.value = withTiming(valueToPosition(finalMin), { duration: 50 });
      runOnJS(updateValues)(finalMin, finalMax);
    });

  // Gesture para el handle máximo (solo horizontal, previene scroll vertical)
  const maxGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-15, 15])
    .onStart(() => {
      "worklet";
      isDraggingMax.value = true;
      maxStartX.value = maxPosition.value;
    })
    .onUpdate(event => {
      "worklet";
      const newPosition = Math.max(
        minPosition.value + HANDLE_WIDTH,
        Math.min(maxStartX.value + event.translationX, handleRadiusSV.value + trackWidthSV.value),
      );
      maxPosition.value = newPosition;
      const currentMin = positionToValue(minPosition.value);
      const newMax = positionToValue(newPosition);
      runOnJS(updateValuesThrottled)(
        currentMin,
        Math.min(maxSV.value, Math.max(newMax, currentMin + stepSV.value)),
      );
    })
    .onEnd(() => {
      "worklet";
      isDraggingMax.value = false;
      const finalMin = positionToValue(minPosition.value);
      const finalMax = Math.min(
        maxSV.value,
        Math.max(finalMin + stepSV.value, positionToValue(maxPosition.value)),
      );
      maxPosition.value = withTiming(valueToPosition(finalMax), { duration: 50 });
      runOnJS(updateValues)(finalMin, finalMax);
    });

  return {
    minPosition,
    maxPosition,
    isDraggingMin,
    isDraggingMax,
    minGesture,
    maxGesture,
    SLIDER_WIDTH,
    TRACK_WIDTH,
    HANDLE_RADIUS,
    HANDLE_WIDTH,
  };
}
