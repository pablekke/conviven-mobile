import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

interface TabTransitionProps {
  children: React.ReactNode;
}

export const TabTransition: React.FC<TabTransitionProps> = ({ children }) => {
  const opacity = useSharedValue(1);
  const [isVisible, setIsVisible] = useState(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      // Al entrar: fade in suave
      setIsVisible(true);
      opacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      // Al salir: función de cleanup
      return () => {
        opacity.value = withTiming(0, {
          duration: 150,
          easing: Easing.in(Easing.cubic),
        });
      };
    }, [opacity]),
  );

  if (!isVisible) return null;

  return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TabTransition;
