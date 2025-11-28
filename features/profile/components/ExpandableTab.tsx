import React from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface ExpandableTabProps {
  scrollY: Animated.Value;
  onExpand: () => void;
}

export const ExpandableTab: React.FC<ExpandableTabProps> = ({ scrollY, onExpand }) => {
  return (
    <Animated.View
      style={[
        styles.expandButtonContainer,
        {
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100, 120, 200, 280],
                outputRange: [-140, -140, -28, -7, 0], // Compensa scaleY para expandirse desde arriba (centro a 140px)
                extrapolate: "clamp",
              }),
            },
            {
              scaleY: scrollY.interpolate({
                inputRange: [0, 100, 120, 200, 280],
                outputRange: [0, 0, 0.8, 0.95, 1], // Expansión rápida al bajar, gradual al subir
                extrapolate: "clamp",
              }),
            },
          ],
          opacity: scrollY.interpolate({
            inputRange: [0, 100, 120, 200, 280],
            outputRange: [0, 0, 0.9, 0.95, 1], // Aparece rápido al bajar, desaparece gradual al subir
            extrapolate: "clamp",
          }),
        },
      ]}
    >
      <TouchableOpacity style={styles.expandButton} onPress={onExpand} activeOpacity={1}>
        <LinearGradient
          colors={["#0052D4", "#007BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Feather name="chevron-down" size={34} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  expandButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
    height: 280,
  },
  expandButton: {
    width: "100%",
    height: 90,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
