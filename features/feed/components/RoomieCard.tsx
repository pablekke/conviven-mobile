import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import { AvatarFallback } from "./AvatarFallback";
import type { Roomie } from "../types";

export interface RoomieCardProps {
  roomie: Roomie;
  isNext?: boolean;
}

export function RoomieCard({ roomie, isNext = false }: RoomieCardProps) {
  const { colors } = useTheme();
  const cardStyle = isNext ? styles.nextCard : styles.card;

  const photos = React.useMemo(() => {
    const gallery = Array.isArray(roomie.photoGallery) ? roomie.photoGallery.filter(Boolean) : [];
    const unique = [roomie.photo, ...gallery].filter(
      (u, idx, arr) => !!u && arr.indexOf(u) === idx,
    ) as string[];
    return unique.length > 0 ? unique : ["__FALLBACK__"];
  }, [roomie.photo, roomie.photoGallery]);

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

  const locationLabel = React.useMemo(() => {
    const neighborhood = roomie.neighborhood?.trim();
    const department = roomie.department?.trim();
    const parts = [neighborhood, department].filter(Boolean) as string[];
    return parts.length > 0 ? parts.join(", ") : undefined;
  }, [roomie.neighborhood, roomie.department]);

  return (
    <View
      style={[
        cardStyle,
        {
          backgroundColor: colors.card,
          transform: isNext ? [{ scale: 0.95 }] : undefined,
        },
        styles.cardShadow,
      ]}
    >
      {/* Foto de fondo */}
      {photos[0] !== "__FALLBACK__" ? (
        <Image source={{ uri: photos[0] }} style={styles.backgroundImage} resizeMode="cover" />
      ) : (
        <View style={styles.backgroundImage}>
          <AvatarFallback name={roomie.name} size={720} />
        </View>
      )}

      {/* Degradado superior */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Barras de progreso (número de fotos) */}
      <View style={styles.topBarsContainer}>
        {photos.map((_, index) => (
          <View
            key={`${index}`}
            style={[styles.topBar, index === 0 ? styles.topBarActive : undefined]}
          />
        ))}
      </View>

      {/* Degradado inferior */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.95)"]}
        locations={[0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{displayName}</Text>
            {locationLabel && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.activityRow}>
          <View style={styles.activeDot} />
          <Text style={styles.activityText}>{lastActiveLabel}</Text>
        </View>

        {interests.length > 0 && (
          <View>
            <View style={styles.horizontalScrollShadow} />
            <View style={styles.horizontalScrollContainer}>
              <View style={styles.horizontalScrollInner}>
                {interests.map(tag => (
                  <View key={tag} style={styles.interestTag}>
                    <Text style={styles.interestText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {roomie.bio && (
          <View style={styles.bioContainer}>
            <Text numberOfLines={2} style={styles.bioText}>
              "{roomie.bio}"
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  nextCard: { flex: 1 },
  cardShadow: {
    borderRadius: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  topBarsContainer: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 6,
  },
  topBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  topBarActive: {
    backgroundColor: "#ffffff",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Conviven-Bold",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Conviven-Regular",
    marginLeft: 4,
  },
  matchBadge: {
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  matchLabel: {
    color: "#93C5FD",
    fontSize: 10,
    fontFamily: "Conviven-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  matchValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Conviven-Bold",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: "#10B981",
    borderRadius: 4,
    marginRight: 8,
  },
  activityText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Conviven-Regular",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  horizontalScrollContainer: {
    marginBottom: 12,
  },
  horizontalScrollInner: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
  },
  horizontalScrollShadow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: "transparent",
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  interestText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Conviven-SemiBold",
  },
  bioContainer: {
    marginTop: 8,
  },
  bioText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Conviven-Regular",
    fontStyle: "italic",
    lineHeight: 20,
  },
});
