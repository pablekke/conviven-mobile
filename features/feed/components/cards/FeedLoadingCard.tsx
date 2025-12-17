import { FEED_CONSTANTS, computeHeroImageHeight } from "../../constants/feed.constants";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useState, useEffect } from "react";
import Spinner from "../../../../components/Spinner";

const LOADING_PHRASES = [
  "Buscando los mejores matches para vos",
  "Encontrando tu compañero ideal",
  "Analizando perfiles compatibles",
  "Tu próximo roomie está a un swipe de distancia",
  "Buscando personas que encajen con tu estilo",
  "Encontrando matches perfectos",
  "Casi listo, estamos buscando",
  "Tu compañero ideal te está esperando",
  "Filtrando perfiles que coincidan contigo",
  "Preparando los mejores candidatos",
];

function FeedLoadingCardComponent() {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);
  const [currentPhrase, setCurrentPhrase] = useState(
    LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { height: heroImageHeight }]} pointerEvents="none">
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Spinner size={52} color="#FFFFFF" trackColor="rgba(255,255,255,0.15)" thickness={5} />
          <Text style={styles.phrase}>{currentPhrase}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export const FeedLoadingCard = memo(FeedLoadingCardComponent);

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
    gap: 24,
    maxWidth: 320,
  },
  phrase: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    paddingHorizontal: 32,
    fontFamily: "Inter-Medium",
  },
});

