import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import type { Roomie } from "../types";
import { CleaningFrequency, GenderPreference } from "../../../core/enums";

export interface RoomieInfoSectionProps {
  roomie: Roomie;
}

const CLEANING_LABELS: Record<CleaningFrequency, string> = {
  [CleaningFrequency.DAILY]: "Limpieza diaria",
  [CleaningFrequency.WEEKLY]: "Limpieza semanal",
  [CleaningFrequency.MONTHLY]: "Limpieza mensual",
};

const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  [GenderPreference.MALE]: "Hombres",
  [GenderPreference.FEMALE]: "Mujeres",
  [GenderPreference.NON_BINARY]: "No binario",
  [GenderPreference.UNSPECIFIED]: "Sin especificar",
  [GenderPreference.MOSTLY_MEN]: "Mayormente hombres",
  [GenderPreference.MOSTLY_WOMEN]: "Mayormente mujeres",
  [GenderPreference.ANY]: "Cualquier género",
};

function formatBudget(budget: Roomie["budget"]): string {
  if (!budget) return "Sin presupuesto definido";
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

  const hasMin = typeof budget.min === "number" && budget.min > 0;
  const hasMax = typeof budget.max === "number" && budget.max > 0;

  if (hasMin && hasMax) {
    return `${formatter.format(budget.min!)} - ${formatter.format(budget.max!)}`;
  }

  if (hasMin) {
    return `Desde ${formatter.format(budget.min!)}`;
  }

  if (hasMax) {
    return `Hasta ${formatter.format(budget.max!)}`;
  }

  return "Sin presupuesto definido";
}

function formatGenderPreference(preference: GenderPreference): string {
  return GENDER_PREFERENCE_LABELS[preference] ?? "Cualquier género";
}

function formatLastActive(days?: number): string {
  if (days === undefined || days === null) return "Actividad reciente";
  if (days === 0) return "Activo hoy";
  if (days === 1) return "Activo hace 1 día";
  return `Activo hace ${days} días`;
}

export function RoomieInfoSection({ roomie }: RoomieInfoSectionProps) {
  const { colors } = useTheme();

  const containerStyle = React.useMemo(
    () => ({ backgroundColor: colors.card, borderColor: colors.border }),
    [colors.border, colors.card],
  );
  const preferenceTagStyle = React.useMemo(
    () => ({ backgroundColor: colors.muted }),
    [colors.muted],
  );

  const lifestyleHighlights = [
    roomie.lifestyle.smoking
      ? { icon: "flame", label: "Convive con fumadores" }
      : { icon: "leaf-outline", label: "Prefiere ambientes sin humo" },
    roomie.lifestyle.pets
      ? { icon: "paw", label: "Ama a las mascotas" }
      : { icon: "paw-outline", label: "Prefiere hogares sin mascotas" },
    roomie.lifestyle.guests
      ? { icon: "people", label: "Recibe visitas con frecuencia" }
      : { icon: "home", label: "Ambiente tranquilo" },
    {
      icon: "sparkles",
      label: CLEANING_LABELS[roomie.lifestyle.cleaning] ?? "Rutina de limpieza flexible",
    },
  ];

  const lifestylePreferences = roomie.preferences.lifestyle.slice(0, 6);

  return (
    <View className="mt-6">
      <View
        className="rounded-3xl p-5 gap-5"
        style={[styles.container, containerStyle]}
      >
        <View className="gap-2">
          <Text className="text-base font-conviven-semibold" style={{ color: colors.foreground }}>
            Bio
          </Text>
          <Text className="text-sm font-conviven leading-6" style={{ color: colors.mutedForeground }}>
            {roomie.bio || "Aún no compartió una descripción."}
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-base font-conviven-semibold" style={{ color: colors.foreground }}>
            Datos clave
          </Text>

          <InfoRow
            icon="location-outline"
            label="Prefiere vivir en"
            value={roomie.neighborhood ?? "Sin barrio preferido"}
          />
          <InfoRow icon="cash-outline" label="Presupuesto" value={formatBudget(roomie.budget)} />
          <InfoRow
            icon="people-circle-outline"
            label="Busca roomies"
            value={`${formatGenderPreference(roomie.preferences.gender)} · ${roomie.preferences.ageRange.min} a ${roomie.preferences.ageRange.max} años`}
          />
          <InfoRow icon="time-outline" label="Actividad" value={formatLastActive(roomie.lastActiveDays)} />
        </View>

        <View className="gap-3">
          <Text className="text-base font-conviven-semibold" style={{ color: colors.foreground }}>
            Estilo de vida
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {lifestyleHighlights.map(highlight => (
              <HighlightChip key={highlight.label} icon={highlight.icon} text={highlight.label} />
            ))}
          </View>
        </View>

        {lifestylePreferences.length > 0 && (
          <View className="gap-3">
            <Text className="text-base font-conviven-semibold" style={{ color: colors.foreground }}>
              Intereses en común
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {lifestylePreferences.map(item => (
                <View key={item} className="px-3 py-1.5 rounded-full" style={[styles.preferenceTag, preferenceTagStyle]}>
                  <Text className="text-xs font-conviven-semibold" style={{ color: colors.foreground }}>
                    #{item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const { colors } = useTheme();
  const iconWrapperStyle = React.useMemo(() => ({ backgroundColor: colors.muted }), [colors.muted]);

  return (
    <View className="flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-full items-center justify-center" style={iconWrapperStyle}>
        <Ionicons name={icon} size={18} color={colors.foreground} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-conviven-semibold uppercase" style={{ color: colors.mutedForeground }}>
          {label}
        </Text>
        <Text className="text-sm font-conviven" style={{ color: colors.foreground }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

interface HighlightChipProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}

function HighlightChip({ icon, text }: HighlightChipProps) {
  const { colors } = useTheme();
  const chipBackgroundStyle = React.useMemo(
    () => ({ backgroundColor: `${colors.primary}18` }),
    [colors.primary],
  );

  return (
    <View className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5" style={chipBackgroundStyle}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text className="text-xs font-conviven-semibold" style={{ color: colors.primary }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  preferenceTag: {
    opacity: 0.9,
  },
});
