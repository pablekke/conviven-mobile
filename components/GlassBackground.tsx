import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { memo } from "react";

interface GlassBackgroundProps {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export const GlassBackground = memo(({ style, intensity = 80 }: GlassBackgroundProps) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, style]} pointerEvents="none">
      {/* Manchas azules de fondo */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Mancha 1 - Superior izquierda */}
        <View style={styles.blueSpot1}>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.2)", "rgba(37, 99, 235, 0.1)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Mancha 2 - Centro derecha */}
        <View style={styles.blueSpot2}>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.08)", "rgba(37, 99, 235, 0.05)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Mancha 3 - Inferior izquierda */}
        <View style={styles.blueSpot3}>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.2)", "rgba(37, 99, 235, 0.1)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        {/* Mancha 4 - Centro superior */}
        <View style={styles.blueSpot4}>
          <LinearGradient
            colors={["rgba(37, 99, 235, 0.25)", "rgba(37, 99, 235, 0.08)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      </View>

      {/* Capa de blur (vidrio) */}
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFillObject} />
    </View>
  );
});

GlassBackground.displayName = "GlassBackground";

const styles = StyleSheet.create({
  blueSpot1: {
    position: "absolute",
    top: -50,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: "hidden",
  },
  blueSpot2: {
    position: "absolute",
    top: "30%",
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: "hidden",
  },
  blueSpot3: {
    position: "absolute",
    bottom: -40,
    left: -50,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: "hidden",
  },
  blueSpot4: {
    position: "absolute",
    top: "10%",
    left: "20%",
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
  },
});
