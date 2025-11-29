import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";
import { useRangeSlider } from "./useRangeSlider";
import { useRangeSliderAnimations } from "./useRangeSliderAnimations";
import { useRangeSliderFormatter } from "./useRangeSliderFormatter";

const HANDLE_RADIUS = 14; // 28 / 2

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onValueChange: (min: number, max: number) => void;
  step?: number;
  label?: string;
  valueFormatter?: (value: number) => string;
}

export default function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onValueChange,
  step = 1000,
  label,
  valueFormatter,
}: RangeSliderProps) {
  const { colors } = useTheme();
  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);
  const [minInputValue, setMinInputValue] = useState(minValue.toString());
  const [maxInputValue, setMaxInputValue] = useState(maxValue.toString());

  const {
    minPosition,
    maxPosition,
    minGesture,
    maxGesture,
    SLIDER_WIDTH,
    TRACK_WIDTH,
    HANDLE_RADIUS,
  } = useRangeSlider({
    min,
    max,
    minValue,
    maxValue,
    onValueChange,
    step,
  });

  const { minHandleStyle, maxHandleStyle, trackActiveStyle } = useRangeSliderAnimations({
    minPosition,
    maxPosition,
  });

  const { formatValue } = useRangeSliderFormatter({ valueFormatter });

  useEffect(() => {
    if (!editingMin) {
      setMinInputValue(minValue.toString());
    }
  }, [minValue, editingMin]);

  useEffect(() => {
    if (!editingMax) {
      setMaxInputValue(maxValue.toString());
    }
  }, [maxValue, editingMax]);

  const handleMinInputBlur = () => {
    setEditingMin(false);
    const numValue = parseFloat(minInputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      const clampedValue = Math.max(min, Math.min(numValue, maxValue));
      onValueChange(clampedValue, maxValue);
    } else {
      setMinInputValue(minValue.toString());
    }
  };

  const handleMaxInputBlur = () => {
    setEditingMax(false);
    const numValue = parseFloat(maxInputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      const clampedValue = Math.max(minValue, Math.min(numValue, max));
      onValueChange(minValue, clampedValue);
    } else {
      setMaxInputValue(maxValue.toString());
    }
  };

  const handleMinInputSubmit = () => {
    handleMinInputBlur();
  };

  const handleMaxInputSubmit = () => {
    handleMaxInputBlur();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}
      <View style={[styles.sliderContainer, { width: SLIDER_WIDTH }]}>
        {/* Track background */}
        <View
          style={[
            styles.track,
            {
              backgroundColor: colors.muted,
              width: TRACK_WIDTH,
              marginLeft: HANDLE_RADIUS,
            },
          ]}
        />

        {/* Active track */}
        <Animated.View
          style={[styles.trackActive, { backgroundColor: colors.primary }, trackActiveStyle]}
        />

        {/* Min handle */}
        <GestureDetector gesture={minGesture}>
          <Animated.View
            style={[
              styles.handle,
              { backgroundColor: colors.primary, borderColor: colors.primary },
              minHandleStyle,
            ]}
          >
            <View style={[styles.handleInner, { backgroundColor: colors.primaryForeground }]} />
          </Animated.View>
        </GestureDetector>

        {/* Max handle */}
        <GestureDetector gesture={maxGesture}>
          <Animated.View
            style={[
              styles.handle,
              { backgroundColor: colors.primary, borderColor: colors.primary },
              maxHandleStyle,
            ]}
          >
            <View style={[styles.handleInner, { backgroundColor: colors.primaryForeground }]} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Value labels - Editable */}
      <View style={styles.valueContainer}>
        {editingMin ? (
          <TextInput
            style={[styles.valueInput, { color: colors.foreground, borderColor: colors.primary }]}
            value={minInputValue}
            onChangeText={setMinInputValue}
            onBlur={handleMinInputBlur}
            onSubmitEditing={handleMinInputSubmit}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingMin(true)} activeOpacity={0.7}>
            <Text style={[styles.valueText, { color: colors.foreground }]}>
              {formatValue(minValue)}
            </Text>
          </TouchableOpacity>
        )}
        {editingMax ? (
          <TextInput
            style={[styles.valueInput, { color: colors.foreground, borderColor: colors.primary }]}
            value={maxInputValue}
            onChangeText={setMaxInputValue}
            onBlur={handleMaxInputBlur}
            onSubmitEditing={handleMaxInputSubmit}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingMax(true)} activeOpacity={0.7}>
            <Text style={[styles.valueText, { color: colors.foreground }]}>
              {formatValue(maxValue)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: HANDLE_RADIUS,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
    marginBottom: 8,
    overflow: "visible",
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: "100%",
  },
  trackActive: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
  },
  handle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  handleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  valueText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  valueInput: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: "center",
  },
});
