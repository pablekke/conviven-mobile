import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
  Modal,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { MessageCircle, Home, X } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

interface MatchModalProps {
  visible: boolean;
  userImage: string | null;
  matchImage: string | null;
  matchName: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const AnimatedOrb = ({
  color,
  size,
  initialPos,
  duration,
}: {
  color: string;
  size: number;
  initialPos: { x: number; y: number };
  duration: number;
}) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(withTiming(Math.random() * 100 - 50, { duration }), withTiming(0, { duration })),
      -1,
      true,
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 100 - 50, { duration: duration * 1.2 }),
        withTiming(0, { duration: duration * 1.2 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialPos.x,
          top: initialPos.y,
        },
        animatedStyle,
      ]}
    />
  );
};

export function MatchModal({
  visible,
  userImage,
  matchImage,
  matchName,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const { colors, isDark } = useTheme();
  const convivenBlue = colors.conviven.blue;

  useEffect(() => {
    if (visible) {
      // 4 vibraciones rápidas, una cada ~300ms (50ms vibración + 250ms espera)
      const pattern = [0, 50, 250, 50, 250, 50, 250, 50];
      Vibration.vibrate(pattern);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.container}>
        {/* Animated Background */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.backgroundContainer, { backgroundColor: colors.background }]}
        >
          <AnimatedOrb
            color={convivenBlue}
            size={height * 0.4}
            initialPos={{ x: -100, y: height * 0.1 }}
            duration={8000}
          />
          <AnimatedOrb
            color={isDark ? "#1E3A8A" : "#DBEAFE"}
            size={height * 0.3}
            initialPos={{ x: width - 150, y: height * 0.6 }}
            duration={7000}
          />
          <AnimatedOrb
            color={convivenBlue}
            size={height * 0.25}
            initialPos={{ x: width * 0.2, y: height * 0.4 }}
            duration={9000}
          />

          <BlurView
            intensity={Platform.OS === "ios" ? 100 : 120}
            tint={isDark ? "dark" : "light"}
            style={styles.absoluteFill}
          />
        </Animated.View>

        <TouchableOpacity style={styles.closeButton} onPress={onKeepSwiping} activeOpacity={0.7}>
          <X color={colors.foreground} size={28} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Title with Gradient */}
          <Animated.View entering={ZoomIn.delay(0).springify().damping(15).stiffness(150)}>
            <MaskedView maskElement={<Text style={styles.titleMask}>¡Hay Match!</Text>}>
              <LinearGradient
                colors={[convivenBlue, "#60a5fa", convivenBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.title, styles.titleTransparent]}>¡Hay Match!</Text>
              </LinearGradient>
            </MaskedView>
          </Animated.View>

          <Animated.Text
            entering={FadeIn.delay(50).duration(300)}
            style={[styles.subtitle, { color: colors.foreground }]}
          >
            Tu futuro hogar con{" "}
            <Text style={[styles.matchNameHighlight, { color: convivenBlue }]}>{matchName}</Text>{" "}
            está más cerca
          </Animated.Text>

          {/* Images Section */}
          <View style={styles.imagesContainer}>
            <Animated.View
              entering={ZoomIn.delay(50).springify().damping(20).stiffness(150)}
              style={[styles.imageWrapper, { borderColor: colors.card }]}
            >
              <Image source={{ uri: userImage ?? "" }} style={styles.image} contentFit="cover" />
            </Animated.View>

            <Animated.View
              entering={ZoomIn.delay(300).springify().damping(15).stiffness(200)}
              style={styles.houseWrapper}
            >
              <View style={[styles.houseCircle, { backgroundColor: convivenBlue }]}>
                <Home color="white" fill="white" size={32} />
              </View>
            </Animated.View>

            <Animated.View
              entering={ZoomIn.delay(150).springify().damping(20).stiffness(150)}
              style={[
                styles.imageWrapper,
                styles.rightImage,
                { borderColor: colors.card, shadowColor: convivenBlue },
              ]}
            >
              <Image source={{ uri: matchImage ?? "" }} style={styles.image} contentFit="cover" />
            </Animated.View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onSendMessage}
              activeOpacity={0.9}
              style={styles.buttonTouch}
            >
              <Animated.View entering={FadeIn.delay(450).duration(250)}>
                <LinearGradient
                  colors={[convivenBlue, "#1d4ed8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <MessageCircle color="white" size={24} style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Hablar con {matchName}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onKeepSwiping} activeOpacity={0.7}>
              <Animated.View
                entering={FadeIn.delay(550).duration(250)}
                style={styles.secondaryButton}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>
                  Seguir buscando roomies
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    opacity: 0.2,
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  titleMask: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    fontFamily: "Inter-Bold",
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    paddingVertical: 10,
  },
  titleTransparent: {
    opacity: 0,
  },
  matchNameHighlight: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: 60,
    textAlign: "center",
    fontFamily: "Inter-Medium",
    letterSpacing: -0.2,
  },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
    height: 180,
    width: "100%",
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  rightImage: {
    marginLeft: -20,
    marginTop: 30,
  },
  houseWrapper: {
    position: "absolute",
    zIndex: 10,
    top: 50,
    left: "50%",
    marginLeft: -35,
  },
  houseCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  buttonTouch: {
    width: "100%",
    maxWidth: 340,
  },
  primaryButton: {
    height: 60,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  buttonIcon: {
    marginRight: 10,
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
});
