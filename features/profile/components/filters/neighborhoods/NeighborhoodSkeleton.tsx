import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../../../context/ThemeContext";

interface NeighborhoodSkeletonProps {
  count?: number;
}

export const NeighborhoodSkeleton: React.FC<NeighborhoodSkeletonProps> = ({ count = 1 }) => {
  const { colors } = useTheme();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} colors={colors} delay={index * 100} />
      ))}
    </>
  );
};

const SkeletonItem: React.FC<{ colors: any; delay?: number }> = ({ colors, delay = 0 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start();
    };

    const timer = setTimeout(startAnimation, delay);
    return () => {
      clearTimeout(timer);
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim, delay]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: [0, 0.8, 1, 0.8, 0],
  });

  return (
    <View
      style={[
        styles.optionButton,
        {
          backgroundColor: colors.muted,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.optionContent}>
        <View
          style={[
            styles.skeletonTextContainer,
            {
              width: Math.random() * 100 + 120,
            },
          ]}
        >
          <View
            style={[
              styles.skeletonText,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmer,
              {
                backgroundColor: colors.card,
                opacity: shimmerOpacity,
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonTextContainer: {
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  skeletonText: {
    height: 16,
    borderRadius: 8,
    width: "100%",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 16,
    borderRadius: 8,
  },
});
