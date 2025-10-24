import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../context/ThemeContext";
import { DiscoverCandidate } from "../types";

export interface DiscoverCardProps {
  candidate: DiscoverCandidate;
  nextCandidateName?: string;
}

const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

export const DiscoverCard: React.FC<DiscoverCardProps> = ({ candidate, nextCandidateName }) => {
  const { colors } = useTheme();

  return (
    <View className="relative">
      {/* Pista de la siguiente card (sutil atrás) */}
      {nextCandidateName ? (
        <View
          className="absolute left-4 right-4 top-4 rounded-3xl border"
          style={[
            styles.nextCard,
            {
              borderColor: `${colors.border}70`,
              backgroundColor: colors.card,
              transform: [{ scale: 0.96 }],
            },
          ]}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Text className="font-conviven-semibold text-muted-foreground">
              Próximo perfil: {nextCandidateName}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Card principal */}
      <View
        className="rounded-3xl overflow-hidden border"
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {!!candidate.photoUrl && (
          <Image
            source={{ uri: candidate.photoUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* Degradado inferior para texto (como el mockup) */}
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.75)"]}
          locations={[0.2, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Contenido bottom */}
        <View style={styles.contentBottom}>
          {/* Título: nombre, edad + distancia */}
          <View style={styles.titleContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.title}>
                {candidate.name}
                {candidate.age ? `, ${candidate.age}` : ""}
              </Text>

              <View style={styles.subtitleContainer}>
                {/* Puntos de paginación (mockup) - decorativo */}
                <View style={styles.dotsContainer}>
                  <View style={styles.dot} />
                  <View style={styles.dotSecondary} />
                  <View style={styles.dotTertiary} />
                </View>

                {/* Distancia */}
                {!!candidate.distanceText && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="navigate-outline" size={14} color="#cbd5e1" />
                    <Text style={styles.distance}>{candidate.distanceText}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Match score opcional */}
            {typeof candidate.matchScore === "number" ? (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>compatibilidad</Text>
                <Text style={styles.scoreValue}>{candidate.matchScore}%</Text>
              </View>
            ) : null}
          </View>

          {/* Indicadores rápidos */}
          <View style={styles.indicatorsContainer}>
            {typeof candidate.lastActiveDays === "number" && (
              <Text style={styles.indicatorText}>Activo hace {candidate.lastActiveDays} días</Text>
            )}
            {typeof candidate.profileCompletionPercent === "number" && (
              <Text style={styles.indicatorText}>
                Perfil {Math.max(0, Math.min(100, candidate.profileCompletionPercent))}%
              </Text>
            )}
          </View>

          {/* Chips de intereses */}
          {!!candidate.interests?.length && (
            <View style={styles.interestsContainer}>
              {candidate.interests.map(interest => (
                <Chip key={interest} label={interest} />
              ))}
            </View>
          )}

          {/* BIO */}
          {!!candidate.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>BIO</Text>
              <Text style={styles.bio} numberOfLines={3}>
                {candidate.bio}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nextCard: { height: 420 },
  card: {
    height: 520, // un poco más alta para el efecto de foto a pantalla
  },
  contentBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameContainer: {
    flexShrink: 1,
    paddingRight: 12,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Conviven-Bold",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  dotSecondary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    opacity: 0.6,
  },
  dotTertiary: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    opacity: 0.3,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "Conviven-Regular",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreLabel: {
    color: "#cbd5e1",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: "Conviven-Regular",
  },
  scoreValue: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Conviven-SemiBold",
  },
  indicatorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  indicatorText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "Conviven-Regular",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Conviven-SemiBold",
  },
  bioContainer: {
    marginTop: 14,
  },
  bioLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "Conviven-SemiBold",
    marginBottom: 6,
  },
  bio: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Conviven-Regular",
  },
});
