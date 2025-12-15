import { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface AnimatedHeaderBackgroundProps {
  style?: any;
}

export default function AnimatedHeaderBackground({ style }: AnimatedHeaderBackgroundProps) {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(-50, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { translateX: translateX.value },
        { scale: 1.5 },
      ],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.animatedBackground, animatedStyle]}>
        <LinearGradient
          // Uses multiple stops to create a "swirly" liquid look when rotated
          colors={["#0052D4", "#4364F7", "#6FB1FC", "#0052D4", "#4364F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#0052D4",
  },
  animatedBackground: {
    position: "absolute",
    top: -width,
    left: -width,
    width: width * 3,
    height: width * 3,
    alignItems: "center",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});
