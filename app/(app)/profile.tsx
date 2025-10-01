import React, { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const formatLabel = (label?: string | null, fallback: string = "No disponible") =>
  label && label !== "" ? label : fallback;

const QuickBadge = ({ label }: { label: string }) => {
  const { colors } = useTheme();

  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: `${colors.conviven.blue}12` }}
    >
      <Text className="text-xs font-conviven-semibold" style={{ color: colors.conviven.blue }}>
        {label}
      </Text>
    </View>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { colors } = useTheme();

  return (
    <View
      className="p-5 rounded-2xl border mb-4"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <Text className="text-sm uppercase tracking-[3px] text-muted-foreground font-conviven mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const name = useMemo(
    () =>
      user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sin nombre"),
    [user?.firstName, user?.lastName, user?.name],
  );

  const heroMessage = useMemo(() => {
    const neighborhood = formatLabel(user?.neighborhoodName ?? user?.neighborhoodId, "tu zona");
    return `Construyamos un match increíble en ${neighborhood}`;
  }, [user?.neighborhoodId, user?.neighborhoodName]);

  const lifestyleBadges = useMemo(
    () => [
      formatLabel(user?.profession ?? user?.jobTitle, "Team orden"),
      formatLabel(user?.petFriendly ? "Pet friendly" : undefined, "Buen roomie"),
      formatLabel(user?.hobby, "Lover de espacios chill"),
    ],
    [user?.hobby, user?.petFriendly, user?.profession, user?.jobTitle],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="relative">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-28 h-28 rounded-full" />
            ) : (
              <View
                className="w-28 h-28 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.conviven.blue}15` }}
              >
                <Text
                  className="text-3xl font-conviven-bold"
                  style={{ color: colors.conviven.blue }}
                >
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.conviven.blue }}
            >
              <Text className="text-white font-conviven-semibold text-xs">Tú</Text>
            </View>
          </View>

          <Text className="text-2xl font-conviven-bold text-foreground mt-4">{name}</Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-1">
            {formatLabel(user?.profession ?? user?.jobTitle, "Perfil roomie en construcción")}
          </Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-2">
            {formatLabel(user?.email)}
          </Text>

          <View className="flex-row gap-2 mt-4 flex-wrap justify-center">
            {lifestyleBadges.map((badge, index) => (
              <QuickBadge key={`${badge}-${index}`} label={badge} />
            ))}
          </View>
        </View>

        <View
          className="p-5 rounded-3xl mb-6"
          style={{ backgroundColor: `${colors.conviven.blue}10` }}
        >
          <Text className="text-xs font-conviven-semibold uppercase tracking-[3px] text-muted-foreground">
            Tu vibe
          </Text>
          <Text className="text-xl font-conviven-bold text-foreground mt-2 leading-7">
            {heroMessage}
          </Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-3">
            Actualiza tu bio y preferencias para que encontremos roomies alineados a tu energía,
            horarios y estilo de vida.
          </Text>
        </View>

        <Section title="Datos personales">
          <View className="gap-3">
            <InfoRow label="Nombre completo" value={name} />
            <InfoRow label="Fecha de nacimiento" value={formatLabel(user?.birthDate)} />
            <InfoRow label="Género" value={formatLabel(user?.gender)} />
            <InfoRow label="Teléfono" value={formatLabel(user?.phone)} />
          </View>
        </Section>

        <Section title="Ubicación y comunidad">
          <View className="gap-3">
            <InfoRow
              label="Departamento"
              value={formatLabel(user?.departmentName ?? user?.departmentId)}
            />
            <InfoRow
              label="Barrio"
              value={formatLabel(user?.neighborhoodName ?? user?.neighborhoodId)}
            />
            <InfoRow label="Dirección de referencia" value={formatLabel(user?.location)} />
          </View>
        </Section>

        <Section title="Sobre ti">
          <Text className="text-base font-conviven text-foreground leading-5">
            {formatLabel(
              user?.bio,
              "Cuéntale al mundo cómo eres, qué te gusta y qué buscas en un roomie. Manténlo auténtico y cercano.",
            )}
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm font-conviven text-muted-foreground">{label}</Text>
      <Text
        className="text-sm font-conviven-semibold text-foreground"
        style={{ color: colors.foreground }}
      >
        {value}
      </Text>
    </View>
  );
}
