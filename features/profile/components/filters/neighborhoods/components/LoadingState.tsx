import { useTheme } from "../../../../../../context/ThemeContext";
import { NeighborhoodSkeleton } from "../NeighborhoodSkeleton";
import { ScrollView, View, StyleSheet } from "react-native";
import { SearchBar } from "../SearchBar";
import { memo } from "react";

export const LoadingState = memo(() => {
  const { colors } = useTheme();

  return (
    <>
      <SearchBar value="" onChangeText={() => {}} placeholder="Buscar barrio..." />
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        <NeighborhoodSkeleton count={8} />
      </ScrollView>
      <View style={styles.footer}>
        <View style={[styles.skeletonText, { backgroundColor: colors.muted }]} />
        <View style={[styles.skeletonButton, { backgroundColor: colors.muted }]} />
      </View>
    </>
  );
});

LoadingState.displayName = "LoadingState";

const styles = StyleSheet.create({
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 400,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  skeletonText: {
    height: 16,
    borderRadius: 8,
  },
  skeletonButton: {
    height: 50,
    borderRadius: 12,
    marginTop: 12,
  },
});
