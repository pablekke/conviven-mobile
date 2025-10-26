import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import type { Roomie } from "../types";

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
    () => (roomie.age && roomie.age > 0 ? `${roomie.name} ${roomie.age}` : roomie.name),
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

        {/* Indicadores (barras) en el tope, centrados */}
        <View className="absolute top-2 left-0 right-0 items-center">
          <View className="flex-row gap-2 px-10 w-full justify-center">
            <View style={styles.progressBarActive} />
            <View style={styles.progressBar} />
          </View>
        </View>

        {/* Bottom overlay content */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFillObject]}
        />

        <View className="absolute bottom-0 left-0 right-0 p-5 gap-4">
          <View className="flex-row items-end justify-between">
            <View className="shrink flex-row items-center">
              <Text className="text-white text-[30px] font-conviven-bold mr-2">{displayName}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text className="text-white/85 text-sm font-conviven">{lastActiveLabel}</Text>
          </View>

          {interests.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-1">
              {interests.map((tag, idx) => (
                <View
                  key={tag}
                  className="px-3 py-1 rounded-full"
                  style={idx === 0 ? styles.primaryPill : styles.secondaryPill}
                >
                  <Text
                    className="text-[12px] font-conviven-semibold"
                    style={{ color: idx === 0 ? "#fff" : "#e5e7eb" }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {roomie.bio ? (
            <Text numberOfLines={2} className="text-white/95 text-[12px] font-conviven mt-1">
              {`"${roomie.bio}"`}
            </Text>
          ) : null}

          {/* Botón flotante de flecha hacia abajo */}
          <View className="items-center mt-1">
            <TouchableOpacity activeOpacity={0.8} style={styles.downButton}>
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 560 },
  nextCard: { height: 480 },
  locationPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressBarActive: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
  primaryPill: {
    backgroundColor: "#2563EB", // azul
    borderColor: "transparent",
  },
  secondaryPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  downButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});
