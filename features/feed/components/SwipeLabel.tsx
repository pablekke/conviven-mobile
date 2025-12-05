import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import React from "react";

interface SwipeLabelProps {
  text: string;
  color: string;
  shadowColor: string;
  animatedStyle: any;
  position: "left" | "right";
}

export const SwipeLabel: React.FC<SwipeLabelProps> = ({
  text,
  color,
  shadowColor,
  animatedStyle,
  position,
}) => {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.labelContainer,
        position === "left" ? styles.labelContainerLeft : styles.labelContainerRight,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.labelBox,
          {
            borderColor: color,
            shadowColor: shadowColor,
          },
        ]}
      >
        <Text style={[styles.labelText, { color }]}>{text}</Text>
        <View style={styles.labelDecoration}>
          <View style={[styles.labelCorner, styles.labelCornerTopLeft, { borderColor: color }]} />
          <View style={[styles.labelCorner, styles.labelCornerTopRight, { borderColor: color }]} />
          <View
            style={[styles.labelCorner, styles.labelCornerBottomLeft, { borderColor: color }]}
          />
          <View
            style={[styles.labelCorner, styles.labelCornerBottomRight, { borderColor: color }]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    position: "absolute",
    zIndex: 120,
    alignItems: "center",
    justifyContent: "center",
    top: "20%",
  },
  labelContainerLeft: {
    left: 20,
  },
  labelContainerRight: {
    right: 20,
  },
  labelBox: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    position: "relative",
    overflow: "visible",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  labelText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  labelDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelCorner: {
    position: "absolute",
    width: 12,
    height: 12,
    borderWidth: 2,
  },
  labelCornerTopLeft: {
    top: -6,
    left: -6,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
  },
  labelCornerTopRight: {
    top: -6,
    right: -6,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 2,
  },
  labelCornerBottomLeft: {
    bottom: -6,
    left: -6,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
  },
  labelCornerBottomRight: {
    bottom: -6,
    right: -6,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 2,
  },
});
