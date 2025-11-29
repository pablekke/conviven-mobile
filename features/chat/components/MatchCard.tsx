import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Match } from "../types/chat.types";
import { PulseIndicator } from "./PulseIndicator";

export interface MatchCardProps {
  match: Match;
  avatarUrl: string;
  cardWidth: number;
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, avatarUrl, cardWidth, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&background=2563EB&color=fff&bold=true&size=128`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center rounded-3xl mr-3"
      style={[styles.matchCard, { width: cardWidth }]}
      activeOpacity={0.8}
    >
      {!match.hasConversation && <PulseIndicator />}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageError ? fallbackAvatarUrl : avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
          onError={handleImageError}
        />
      </View>
      <View className="flex-row items-baseline mt-2">
        <Text className="text-base font-conviven-bold text-white" numberOfLines={1}>
          {match.name.split(" ")[0]}
        </Text>
        {match.age && <Text className="text-sm font-conviven text-white/90 ml-1">{match.age}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    height: 110,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
