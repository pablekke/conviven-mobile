import { View, StyleSheet, ScrollView, Animated } from "react-native";
import React, { useEffect, useRef } from "react";

interface SkeletonChipsProps {
  count: number;
}

export const SkeletonChips: React.FC<SkeletonChipsProps> = ({ count }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => {
      shimmer.stop();
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.9, 0.5],
  });

  const scale = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.98, 1, 0.98],
  });

  // Mostrar entre 2 y 4 skeleton chips
  const skeletonCount = Math.min(count || 3, 4);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Animated.View
            key={`skeleton-${index}`}
            style={[
              styles.skeletonChip,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  skeletonChip: {
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    width: 120,
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
  },
});
