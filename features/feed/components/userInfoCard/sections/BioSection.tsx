import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Feather } from "@expo/vector-icons";

interface BioSectionProps {
  bio?: string;
}

export const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const animatedHeight = useRef(new Animated.Value(80)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  const COLLAPSED_HEIGHT = 72 + 8;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (contentHeight > 0) {
      const targetHeight = expanded
        ? contentHeight + 20
        : isTruncated
          ? COLLAPSED_HEIGHT
          : contentHeight;

      // Bajada (expandir) rápida, Subida (colapsar) manteniendo el ritmo que le gustaba
      const duration = expanded ? 100 : 200;

      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: targetHeight,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(iconRotation, {
          toValue: expanded ? 1 : 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [expanded, contentHeight, isTruncated]); // Quitamos dependencias innecesarias

  const rotate = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  if (!bio) return null;

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpand} style={styles.contentContainer}>
        <Animated.View
          style={[styles.animatedContent, { height: isTruncated ? animatedHeight : undefined }]}
        >
          <View
            onLayout={event => {
              const height = event.nativeEvent.layout.height;
              setContentHeight(height);
              if (height > COLLAPSED_HEIGHT + 10) {
                setIsTruncated(true);
                if (!expanded) {
                  animatedHeight.setValue(COLLAPSED_HEIGHT);
                }
              }
            }}
          >
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        </Animated.View>

        {isTruncated && (
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Feather name="chevron-down" size={24} color="#1E293B" />
            </Animated.View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    marginTop: -50,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  contentContainer: {
    width: "100%",
  },
  animatedContent: {
    overflow: "hidden",
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1E293B",
    fontFamily: "Inter-Regular",
    textAlign: "left",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 8,
    opacity: 0.8,
    height: 24,
    justifyContent: "center",
  },
});
