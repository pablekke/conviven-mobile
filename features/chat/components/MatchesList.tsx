/**
 * Componente que muestra los matches con los que aún no se ha iniciado conversación
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export interface Match {
  id: string;
  name: string;
  avatar: string;
  age?: number;
}

export interface MatchesListProps {
  matches: Match[];
  onMatchPress?: (matchId: string) => void;
}

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
        {matches.map(match => (
          <TouchableOpacity
            key={match.id}
            onPress={() => onMatchPress?.(match.id)}
            className="items-center justify-center bg-white/10 rounded-3xl mr-3"
            style={[styles.matchCard, { width: cardWidth }]}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: match.avatar }} style={styles.avatar} />
            </View>
            <View className="flex-row items-baseline mt-2">
              <Text className="text-base font-conviven-bold text-white" numberOfLines={1}>
                {match.name.split(" ")[0]}
              </Text>
              {match.age && (
                <Text className="text-sm font-conviven text-white/80 ml-1">{match.age}</Text>
              )}
            </View>
            <View className="flex-row items-center mt-1 bg-white/20 px-2 py-0.5 rounded-full">
              <Ionicons name="hand-left-outline" size={10} color="white" />
              <Text className="text-[10px] font-conviven text-white ml-1">Saludar</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  matchCard: {
    height: 145,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
