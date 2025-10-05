import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const PROGRESS_BAR_PROMPT =
  "Próximo sprint: conectar este checklist con la barra de progreso usando el manual de puntajes del backend y los endpoints que ya tenemos documentados.";

const formatLabel = (label?: string | null, fallback: string = "No disponible") =>
  label && label !== "" ? label : fallback;

const formatGenderValue = (gender?: string | null) => {
  if (!gender) {
    return undefined;
  }

  const normalized = gender.toString().toUpperCase();

  switch (normalized) {
    case "MALE":
      return "Masculino";
    case "FEMALE":
      return "Femenino";
    case "NON_BINARY":
      return "No binarie";
    case "UNSPECIFIED":
      return "Prefiero no decir";
    default:
      return gender;
  }
};

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

const StatusBanner = ({
  label,
  description,
  accent,
  textColor,
  onEdit,
}: {
  label: string;
  description: string;
  accent: string;
  textColor: string;
  onEdit: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="rounded-3xl px-5 py-4 mb-6"
      style={{ backgroundColor: accent }}
      onPress={onEdit}
    >
      <Text
        className="text-xs font-conviven-semibold uppercase tracking-[3px]"
        style={{ color: textColor }}
      >
        Estado
      </Text>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xl font-conviven-bold flex-1 pr-4" style={{ color: textColor }}>
          {label}
        </Text>
        <Feather name="edit-3" size={18} color={textColor} />
      </View>
      <Text className="text-sm font-conviven mt-2 leading-5" style={{ color: `${textColor}cc` }}>
        {description}
      </Text>
      <Text className="text-xs font-conviven-semibold mt-3" style={{ color: `${textColor}b5` }}>
        Toca para actualizar tu búsqueda y mantener a la comunidad en sintonía.
      </Text>
    </TouchableOpacity>
  );
};

const VerificationPill = ({
  icon,
  label,
  tone,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  tone: "success" | "pending";
}) => {
  const { colors } = useTheme();
  const background = tone === "success" ? `${colors.conviven.blue}18` : `${colors.conviven.orange}22`;
  const color = tone === "success" ? colors.conviven.blue : colors.conviven.orange;

  return (
    <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: background }}>
      <Feather name={icon} size={16} color={color} />
      <Text className="text-xs font-conviven-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
};

const MatchSignal = ({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: number;
  description: string;
}) => {
  const { colors } = useTheme();
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name={icon} size={18} color={colors.conviven.blue} />
          <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        </View>
        <Text className="text-sm font-conviven-semibold text-foreground">{width}%</Text>
      </View>
      <View className="h-2 rounded-full mt-2" style={{ backgroundColor: `${colors.conviven.blue}16` }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: colors.conviven.blue }}
        />
      </View>
      <Text className="text-xs font-conviven text-muted-foreground mt-2 leading-4">{description}</Text>
    </View>
  );
};

const PreferenceItem = ({
  icon,
  title,
  summary,
  details,
  expanded,
  onToggle,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  summary: string;
  details: string;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      className="border rounded-2xl px-4 py-3 mb-3"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start gap-3 flex-1 pr-4">
          <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: `${colors.conviven.orange}18` }}>
            <MaterialCommunityIcons name={icon} size={22} color={colors.conviven.orange} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-conviven-semibold text-foreground">{title}</Text>
            <Text className="text-xs font-conviven text-muted-foreground mt-1">{summary}</Text>
            {expanded && (
              <Text className="text-sm font-conviven text-foreground mt-2 leading-5">{details}</Text>
            )}
          </View>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </View>
    </Pressable>
  );
};

const QuickActionButton = ({
  icon,
  label,
  helper,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  helper: string;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="border rounded-2xl px-4 py-3 flex-row items-center gap-3"
      style={{ borderColor: colors.border }}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.conviven.blue}12` }}>
        <Feather name={icon} size={20} color={colors.conviven.blue} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
      <Feather name="arrow-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
};

const ChecklistItem = ({
  label,
  helper,
  completed,
}: {
  label: string;
  helper: string;
  completed: boolean;
}) => {
  const { colors } = useTheme();
  const background = completed ? `${colors.conviven.blue}16` : colors.muted;
  const iconName = completed ? "check-circle" : "circle";
  const iconColor = completed ? colors.conviven.blue : colors.mutedForeground;

  return (
    <View
      className="flex-row items-start gap-3 px-4 py-3 rounded-2xl"
      style={{ backgroundColor: background }}
    >
      <View className="mt-[2px]">
        <Feather name={iconName} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cleanliness: true,
  });

  const name = useMemo(
    () => user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sin nombre"),
    [user?.firstName, user?.lastName, user?.name],
  );

  const heroMessage = useMemo(() => {
    const neighborhood = formatLabel(user?.neighborhoodName ?? user?.neighborhoodId, "tu zona");
    return `Construyamos un match increíble en ${neighborhood}`;
  }, [user?.neighborhoodId, user?.neighborhoodName]);

  const searchStatusMeta = useMemo(() => {
    const rawStatus = (user?.searchStatus ?? user?.status ?? "active").toString().toLowerCase();

    if (rawStatus.includes("pause") || rawStatus.includes("paus")) {
      return {
        label: "Pausaste tu búsqueda",
        description: "Cuando quieras volver a la acción, edita tu estado y retoma la aventura roomie.",
        accent: `${colors.muted}dd`,
        textColor: colors.foreground,
      };
    }

    if (rawStatus.includes("match") || rawStatus.includes("activo")) {
      return {
        label: "Buscando match roomie",
        description: "Estamos conectándote con personas que comparten tu vibe y estilo de convivencia.",
        accent: `${colors.conviven.blue}dd`,
        textColor: "#ffffff",
      };
    }

    return {
      label: "Explorando opciones",
      description: "Completa tus preferencias para que los matches se sientan tan naturales como tu playlist favorita.",
      accent: `${colors.conviven.orange}d8`,
      textColor: colors.foreground,
    };
  }, [
    colors.conviven.blue,
    colors.conviven.orange,
    colors.foreground,
    colors.muted,
    user?.searchStatus,
    user?.status,
  ]);

  const lifestyleBadges = useMemo(
    () => [
      formatLabel(user?.profession ?? user?.jobTitle, "Team orden"),
      formatLabel(user?.petFriendly ? "Pet friendly" : undefined, "Buen roomie"),
      formatLabel(user?.hobby, "Lover de espacios chill"),
    ],
    [user?.hobby, user?.petFriendly, user?.profession, user?.jobTitle],
  );

  const verificationBadges = useMemo(() => {
    const verification = user?.verificationStatus;
    const trustLevel = verification?.reliabilityLevel ??
      (user?.reliabilityScore && user.reliabilityScore >= 80
        ? "Confianza top"
        : user?.reliabilityScore && user.reliabilityScore >= 60
          ? "Roomie confiable"
          : "Confianza en construcción");

    return [
      {
        icon: "mail" as const,
        label: verification?.email ? "Email verificado" : "Verifica tu email",
        tone: verification?.email ? "success" : "pending",
      },
      {
        icon: "shield" as const,
        label: verification?.identity ? "Identidad confirmada" : "Documentos pendientes",
        tone: verification?.identity ? "success" : "pending",
      },
      {
        icon: "phone" as const,
        label: verification?.phone ? "Teléfono verificado" : "Suma tu teléfono",
        tone: verification?.phone ? "success" : "pending",
      },
      {
        icon: "users" as const,
        label: `Referencias (${verification?.references ?? 0})`,
        tone: verification && verification.references > 0 ? "success" : "pending",
      },
      {
        icon: "award" as const,
        label: trustLevel ?? "Confianza en construcción",
        tone: user?.reliabilityScore && user.reliabilityScore >= 60 ? "success" : "pending",
      },
    ];
  }, [user?.reliabilityScore, user?.verificationStatus]);

  const preferenceSections = useMemo(
    () => [
      {
        id: "cleanliness",
        icon: "broom" as const,
        title: "Rituales de limpieza",
        summary:
          user?.roommatePreferences?.cleanlinessLevel ??
          "Describe cada cuánto te gusta resetear los espacios compartidos.",
        details:
          user?.roommatePreferences?.cleanlinessLevel ??
          "¿Sábados de limpieza express o team limpieza consciente diaria? Compartí tu estilo para alinear expectativas.",
      },
      {
        id: "schedules",
        icon: "clock-outline" as const,
        title: "Horarios y ritmo",
        summary:
          user?.roommatePreferences?.schedules ??
          "¿Sos ave nocturna, team mañanas o flow híbrido?",
        details:
          user?.roommatePreferences?.schedules ??
          "Contá tus horarios de trabajo/estudio y cuándo disfrutás de tu tiempo chill para encontrar una dupla ideal.",
      },
      {
        id: "pets",
        icon: "paw" as const,
        title: "Mascotas y compañía",
        summary:
          user?.roommatePreferences?.petsPolicy ??
          (user?.petFriendly ? "¡Amo convivir con mascotas!" : "Aún no defino mi política pet friendly."),
        details:
          user?.roommatePreferences?.petsPolicy ??
          "Compartí si convivís con mascotas, cuáles son sus rituales y cómo imaginás la convivencia peluda perfecta.",
      },
      {
        id: "guests",
        icon: "account-heart-outline" as const,
        title: "Visitas y momentos sociales",
        summary:
          user?.roommatePreferences?.guestsPolicy ??
          "Define cómo te gusta recibir amigxs, familia o pareja.",
        details:
          user?.roommatePreferences?.guestsPolicy ??
          "¿Team juntada tranqui o preferís reservarlo para ocasiones especiales? Compartílo para alinear expectativas.",
      },
    ],
    [user?.petFriendly, user?.roommatePreferences],
  );

  const matchSignals = useMemo(
    () => {
      const reliabilityScore = Math.min(Math.max(user?.reliabilityScore ?? 68, 0), 100);
      const referencesScore = Math.min((user?.verificationStatus?.references ?? 0) * 15 + 40, 95);
      const vibeScore = reliabilityScore > 75 ? 88 : reliabilityScore > 60 ? 78 : 65;

      return [
        {
          id: "alignment",
          icon: "sun" as const,
          label: "Match energético",
          value: vibeScore,
          description: "Tu bio y vibe inspiran confianza. Sumá detalles para lograr el match soñado.",
        },
        {
          id: "trust",
          icon: "shield" as const,
          label: "Confianza de la comunidad",
          value: reliabilityScore,
          description: "Mientras más completes tu perfil, más destacado será tu lugar en la comunidad.",
        },
        {
          id: "references",
          icon: "message-circle" as const,
          label: "Referencias y feedback",
          value: referencesScore,
          description: "Pedir referencias suma puntos extra y ayuda a que los matches fluyan sin dudas.",
        },
      ];
    },
    [user?.reliabilityScore, user?.verificationStatus?.references],
  );

  const quickActions = useMemo(
    () => [
      {
        id: "share",
        icon: "share-2" as const,
        label: "Compartir perfil",
        helper: "Invita a tus amigxs a recomendarte roomies afines.",
        action: () =>
          Share.share({
            message: `¡Hey! Busco roomie y mi perfil en Conviven se ve así: ${user?.email ?? "sumate a la app"}`,
          }).catch(() => undefined),
      },
      {
        id: "references",
        icon: "users" as const,
        label: "Pedir referencias",
        helper: "Solicita reseñas a tus roomies anteriores y subí tu confianza.",
        action: () =>
          Alert.alert(
            "Pedir referencias",
            "Enviá un mensajito a tus roomies previos y pediles que compartan una nota sobre su experiencia. 💫",
          ),
      },
      {
        id: "preferences",
        icon: "sliders" as const,
        label: "Actualizar preferencias",
        helper: "Cuéntanos tus must y nice-to-have para filtrar matches.",
        action: () =>
          Alert.alert(
            "Preferencias",
            "Pronto podrás ajustar cada preferencia desde aquí. Mientras tanto, mantené tu checklist al día.",
          ),
      },
    ],
    [user?.email],
  );

  const checklistItems = useMemo(
    () => [
      {
        id: "photo",
        label: "Sumá una foto que refleje tu vibe",
        helper: "Los roomies conectan más rápido cuando pueden verte sonriendo.",
        completed: Boolean(user?.avatar),
      },
      {
        id: "bio",
        label: "Contá tu historia en la bio",
        helper: "3-4 líneas genuinas bastan para saber si hacen match en energía.",
        completed: Boolean(user?.bio && user.bio.length > 40),
      },
      {
        id: "prefs",
        label: "Configura tus preferencias de convivencia",
        helper: "Limpeza, horarios, visitas y mascotas: lo esencial para convivir en armonía.",
          completed: Boolean(user?.roommatePreferences ?? user?.searchPreferencesId),
      },
      {
        id: "verify",
        label: "Verifica tus datos de contacto",
        helper: "Email y teléfono verificados transmiten confianza instantánea.",
        completed: Boolean(user?.verificationStatus?.email && user?.verificationStatus?.phone),
      },
      {
        id: "references",
        label: "Suma al menos una referencia",
        helper: "Un mensajito cálido de alguien que te conozca vale oro.",
        completed: (user?.verificationStatus?.references ?? 0) > 0,
      },
    ],
    [
      user?.avatar,
      user?.bio,
      user?.roommatePreferences,
      user?.searchPreferencesId,
      user?.verificationStatus?.email,
      user?.verificationStatus?.phone,
      user?.verificationStatus?.references,
    ],
  );

  const checklistProgress = useMemo(() => {
    const total = checklistItems.length;
    const completed = checklistItems.filter(item => item.completed).length;
    return { total, completed };
  }, [checklistItems]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleEditStatus = useCallback(() => {
    Alert.alert(
      "Editar estado",
      "Muy pronto podrás seleccionar si estás buscando activamente, explorando con calma o pausando tu búsqueda.",
    );
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBanner
          label={searchStatusMeta.label}
          description={searchStatusMeta.description}
          accent={searchStatusMeta.accent}
          textColor={searchStatusMeta.textColor}
          onEdit={handleEditStatus}
        />

        <View className="items-center mb-6">
          <View className="relative">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-28 h-28 rounded-full" />
            ) : (
              <View
                className="w-28 h-28 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.conviven.blue}15` }}
              >
                <Text className="text-3xl font-conviven-bold" style={{ color: colors.conviven.blue }}>
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

          <Text className="text-2xl font-conviven-bold text-foreground mt-4 text-center">{name}</Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-1 text-center">
            {formatLabel(user?.profession ?? user?.jobTitle, "Perfil roomie en construcción")}
          </Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-2 text-center">
            {formatLabel(user?.email)}
          </Text>

          <View className="flex-row gap-2 mt-4 flex-wrap justify-center">
            {lifestyleBadges.map((badge, index) => (
              <QuickBadge key={`${badge}-${index}`} label={badge} />
            ))}
          </View>

          <View className="flex-row flex-wrap gap-2 mt-4 justify-center">
            {verificationBadges.map(badge => (
              <VerificationPill key={badge.label} icon={badge.icon} label={badge.label} tone={badge.tone} />
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
          <Text className="text-xl font-conviven-bold text-foreground mt-2 leading-7">{heroMessage}</Text>
          <Text className="text-sm font-conviven text-muted-foreground mt-3">
            Actualiza tu bio y preferencias para que encontremos roomies alineados a tu energía,
            horarios y estilo de vida.
          </Text>
        </View>

        <Section title="Datos personales">
          <View className="gap-3">
            <InfoRow label="Nombre completo" value={name} />
            <InfoRow label="Fecha de nacimiento" value={formatLabel(user?.birthDate)} />
            <InfoRow label="Género" value={formatLabel(formatGenderValue(user?.gender as string))} />
            <InfoRow label="Teléfono" value={formatLabel(user?.phone)} />
          </View>
        </Section>

        <Section title="Ubicación y comunidad">
          <View className="gap-3">
            <InfoRow label="Departamento" value={formatLabel(user?.departmentName ?? user?.departmentId)} />
            <InfoRow label="Barrio" value={formatLabel(user?.neighborhoodName ?? user?.neighborhoodId)} />
            <InfoRow label="Dirección de referencia" value={formatLabel(user?.location)} />
          </View>
        </Section>

        <Section title="Preferencias de convivencia">
          <Text className="text-sm font-conviven text-muted-foreground mb-4">
            Abrí cada sección para contarle a tu futuro match cómo imaginás compartir el hogar. Mientras
            más claridad, más conexiones reales.
          </Text>
          {preferenceSections.map(section => (
            <PreferenceItem
              key={section.id}
              icon={section.icon}
              title={section.title}
              summary={section.summary}
              details={section.details}
              expanded={!!expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </Section>

        <Section title="Conecta con tu match ideal">
          {matchSignals.map(signal => (
            <MatchSignal
              key={signal.id}
              icon={signal.icon}
              label={signal.label}
              value={signal.value}
              description={signal.description}
            />
          ))}
        </Section>

        <Section title="Acciones rápidas">
          <View className="gap-3">
            {quickActions.map(action => (
              <QuickActionButton
                key={action.id}
                icon={action.icon}
                label={action.label}
                helper={action.helper}
                onPress={action.action}
              />
            ))}
          </View>
        </Section>

        <Section title="Checklist para brillar">
          <Text className="text-sm font-conviven text-muted-foreground mb-3">
            ¡Llevas {checklistProgress.completed} de {checklistProgress.total} pasitos completados! Cada
            hito desbloquea más confianza y matches mejor alineados.
          </Text>
          <View className="gap-3">
            {checklistItems.map(item => (
              <ChecklistItem key={item.id} label={item.label} helper={item.helper} completed={item.completed} />
            ))}
          </View>
          <Text className="text-xs font-conviven text-muted-foreground mt-4 italic">
            {PROGRESS_BAR_PROMPT}
          </Text>
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
    <View className="flex-row items-start gap-4">
      <Text className="text-sm font-conviven text-muted-foreground w-32">{label}</Text>
      <Text className="text-sm font-conviven-semibold text-foreground flex-1" style={{ color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

// PROGRESS BAR NEXT ITERATION PROMPT:
// Cuando tengas el manual de puntajes del backend, conecta el estado del checklist con una barra
// de progreso visual que consuma esos endpoints para mostrar el avance en tiempo real.
