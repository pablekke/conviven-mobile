import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { PulseIndicator } from "./PulseIndicator";
import { Match } from "../types/chat.types";
import { MatchCard } from "./MatchCard";
import React from "react";

export type { Match };

export interface MatchesListProps {
  matches: Match[];
  onMatchPress?: (matchId: string) => void;
}

export { PulseIndicator };

export const MatchesList: React.FC<MatchesListProps> = ({ matches, onMatchPress }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 3.6;

  if (!matches || matches.length === 0) {
    return (
      <View className="pb-4 pt-4 px-6">
        <Text className="text-white/80 font-conviven text-center">No tienes matches aún</Text>
      </View>
    );
  }
  const hasLongNames = matches.some(match => {
    const firstName = match.name.split(" ")[0];
    return firstName.length >= 10;
  });

  return (
    <View className="pb-4 pt-1" style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {matches.map(match => {
          // Asegurar que siempre haya un avatar válido
          const avatarUrl =
            match.avatar && match.avatar.trim().length > 0
              ? match.avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&background=2563EB&color=fff&bold=true&size=128`;

          return (
            <MatchCard
              key={match.id}
              match={match}
              avatarUrl={avatarUrl}
              cardWidth={cardWidth}
              hasLongNames={hasLongNames}
              onPress={() => onMatchPress?.(match.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  scrollView: {
    overflow: "visible",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
});
