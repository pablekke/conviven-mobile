import { Animated, StyleSheet, Dimensions, Text } from "react-native";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";

import Spinner from "./Spinner";
import { useTheme } from "../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LOADING_PHRASES = [
  "Buscando los mejores matches para vos...",
  "Encontrando tu compañero ideal...",
  "Analizando perfiles compatibles...",
  "Tu próximo roomie está a un swipe de distancia",
  "Buscando personas que encajen con tu estilo...",
  "Encontrando matches perfectos...",
  "Casi listo, estamos buscando...",
  "Tu compañero ideal te está esperando...",
];

interface LoadingScreenProps {
  onAnimationComplete?: () => void;
  shouldSlideOut?: boolean;
}

export default function LoadingScreen({
  onAnimationComplete,
  shouldSlideOut = false,
}: LoadingScreenProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [currentPhrase, setCurrentPhrase] = useState(
    LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (shouldSlideOut) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [shouldSlideOut, slideAnim, onAnimationComplete]);

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={[
        styles.fullScreen,
        { backgroundColor: colors.conviven.blue },
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <StatusBar style="light" />
      <Spinner size={52} color="#FFFFFF" trackColor="rgba(255,255,255,0.15)" thickness={5} />
      <Text style={styles.phrase}>{currentPhrase}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  phrase: {
    marginTop: 24,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 32,
    fontFamily: "Inter-Medium",
  },
});
