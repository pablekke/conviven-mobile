import React from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

import { Match } from "../types/chat.types";
import { MatchCard } from "./MatchCard";
import { PulseIndicator } from "./PulseIndicator";

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
    return null;
  }

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
