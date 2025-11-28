import React from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RegisterHeader } from "./RegisterHeader";
import { RegisterSubtitle } from "./RegisterSubtitle";

interface RegisterHeaderSectionProps {
  scrollY: Animated.Value;
  onBack: () => void;
}

export const RegisterHeaderSection: React.FC<RegisterHeaderSectionProps> = ({
  scrollY,
  onBack,
}) => {
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 30, 60, 100, 140, 200, 280],
    outputRange: [0, 0, 0, 0, -150, -220, -260],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.headerWrapper,
        {
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      <LinearGradient
        colors={["#0052D4", "#007BFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <RegisterHeader onBack={onBack} />
        <RegisterSubtitle />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 0,
  },
  headerSafeArea: {
    position: "relative",
    zIndex: 1,
  },
});
