import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import type { Roomie } from "../types";
import { MatchScoreBadge } from "./MatchScoreBadge";

export interface RoomieCardProps {
  roomie: Roomie;
  isNext?: boolean;
}

export function RoomieCard({ roomie, isNext = false }: RoomieCardProps) {
  const { colors } = useTheme();
  const cardStyle = isNext ? styles.nextCard : styles.card;

  return (
    <View
      className="rounded-3xl overflow-hidden border"
      style={[
        cardStyle,
        {
          backgroundColor: colors.card,
          borderColor: isNext ? `${colors.border}70` : colors.border,
          transform: isNext ? [{ scale: 0.96 }] : undefined,
        },
      ]}
    >
      <View className="flex-1">
        {roomie.photo ? (
          <Image
            source={{ uri: roomie.photo }}
            className="w-full h-full absolute"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full absolute bg-gray-200" />
        )}

        {/* Top gradient (oscurecer como en la imagen) */}
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.15)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Bottom overlay content */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFillObject]}
        />

        <View className="absolute bottom-0 left-0 right-0 p-5 gap-3">
          <View className="flex-row items-end justify-between">
            <View className="shrink">
              <Text className="text-white text-2xl font-conviven-bold">
                {roomie.name}, {roomie.age}
              </Text>
              <Text className="text-white/80 text-xs font-conviven mt-0.5">
                {roomie.profession}
              </Text>
            </View>
            <MatchScoreBadge score={roomie.matchScore} />
          </View>

          {/* Última actividad + bullets */}
          <Text className="text-white/75 text-xs font-conviven">
            •{" "}
            {roomie.distanceMeters === 0
              ? "Activo ahora"
              : `Activo hace ${roomie.distanceMeters} días`}
          </Text>

          {/* Chips intereses */}
          <View className="flex-row flex-wrap gap-2 mt-1">
            {roomie.interests.map(tag => (
              <View key={tag} className="px-3 py-1 rounded-full border border-white/25">
                <Text className="text-[11px] text-white font-conviven-semibold">#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Bio corta */}
          <Text numberOfLines={3} className="text-white text-sm font-conviven leading-5 mt-1">
            {roomie.bio}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 520 },
  nextCard: { height: 480 },
});
