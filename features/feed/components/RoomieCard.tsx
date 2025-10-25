import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const lastActiveLabel = React.useMemo(() => {
    if (roomie.lastActiveDays === undefined || roomie.lastActiveDays === null) {
      return "Actividad reciente";
    }

    if (roomie.lastActiveDays === 0) {
      return "Activo hoy";
    }

    if (roomie.lastActiveDays === 1) {
      return "Activo hace 1 día";
    }

    return `Activo hace ${roomie.lastActiveDays} días`;
  }, [roomie.lastActiveDays]);

  const interests = React.useMemo(() => roomie.interests.slice(0, 4), [roomie.interests]);
  const displayName = React.useMemo(
    () => (roomie.age && roomie.age > 0 ? `${roomie.name}, ${roomie.age}` : roomie.name),
    [roomie.age, roomie.name],
  );

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

        <View className="absolute top-0 left-0 right-0 px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center px-3 py-1.5 rounded-full" style={styles.locationPill}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text className="text-white text-xs font-conviven-semibold ml-1">
                {roomie.neighborhood ?? "Barrio a definir"}
              </Text>
            </View>

            <MatchScoreBadge score={roomie.matchScore} />
          </View>
        </View>

        <View className="absolute bottom-0 left-0 right-0 p-5 gap-4">
          <View className="flex-row items-end justify-between">
            <View className="shrink">
              <Text className="text-white text-[30px] font-conviven-bold">{displayName}</Text>
              <Text className="text-white/80 text-sm font-conviven mt-0.5">
                {roomie.profession || "Profesión no indicada"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text className="text-white/85 text-sm font-conviven">{lastActiveLabel}</Text>
          </View>

          {interests.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-1">
              {interests.map(tag => (
                <View
                  key={tag}
                  className="px-3 py-1 rounded-full border border-white/30 bg-black/20"
                >
                  <Text className="text-[12px] text-white font-conviven-semibold">#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {roomie.bio ? (
            <Text
              numberOfLines={3}
              className="text-white text-sm font-conviven leading-5 mt-1"
            >
              {roomie.bio}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 520 },
  nextCard: { height: 480 },
  locationPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
