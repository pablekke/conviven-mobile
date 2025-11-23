import { memo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FEED_CONSTANTS, computeHeroImageHeight } from "../constants/feed.constants";

function EmptyFeedCardComponent() {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);

  return (
    <View style={[styles.container, { height: heroImageHeight }]} pointerEvents="none">
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>¡Has visto todos los perfiles!</Text>
          <Text style={styles.subtitle}>
            No hay más personas disponibles por ahora.{"\n"}
            Vuelve más tarde para descubrir nuevos perfiles.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export const EmptyFeedCard = memo(EmptyFeedCardComponent);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    gap: 16,
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
});
