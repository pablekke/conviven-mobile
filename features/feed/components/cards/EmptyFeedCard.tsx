import { FEED_CONSTANTS, computeHeroImageHeight } from "../../constants/feed.constants";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { useMatches } from "../../../chat/hooks";
import { ActionButton } from "../ui/ActionButton";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo } from "react";

function EmptyFeedCardComponent() {
  const { height: winH } = useWindowDimensions();
  const tabBarHeight = FEED_CONSTANTS.TAB_BAR_HEIGHT;
  const heroHeight = Math.max(0, winH + tabBarHeight);
  const heroBottomSpacing = tabBarHeight + FEED_CONSTANTS.HERO_BOTTOM_EXTRA;
  const heroImageHeight = computeHeroImageHeight(heroHeight, heroBottomSpacing);
  const router = useRouter();
  const { colors } = useTheme();
  const { matches } = useMatches();
  const hasMatches = matches && matches.length > 0;

  const handleGoToFilters = () => {
    router.push("/(app)/profile/filters/index");
  };

  const handleGoToMatches = () => {
    router.push("/(app)/chat");
  };

  return (
    <View style={[styles.container, { height: heroImageHeight }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="search" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          No hay más perfiles disponibles
        </Text>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Modificá tus filtros para descubrir más personas que coincidan con tus preferencias.
        </Text>
        <View style={styles.buttonsContainer}>
          <ActionButton
            text="Modificar filtros"
            icon="sliders"
            onPress={handleGoToFilters}
            variant="primary"
            style={styles.buttonPrimary}
          />
        </View>

        {hasMatches && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            O dale otra oportunidad a tus roomies... no roomies 😏
          </Text>
        )}
        <View style={styles.buttonsContainer}>
          <ActionButton
            text="Ver roomies"
            icon="message-circle"
            onPress={handleGoToMatches}
            variant="secondary"
            style={styles.buttonSecondary}
          />
        </View>
      </View>
    </View>
  );
}

export const EmptyFeedCard = memo(EmptyFeedCardComponent);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Inter-SemiBold",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter-Regular",
  },
  buttonsContainer: {
    width: "80%",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  singleButtonContainer: {
    width: "80%",
  },
  buttonPrimary: {
    width: "100%",
  },
  buttonSecondary: {
    flex: 1,
    minWidth: 140,
  },
});
