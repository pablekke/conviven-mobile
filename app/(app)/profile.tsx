import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import UserService from "../../services/userService";
import LocationService from "../../services/locationService";
import { City, Department, Gender, Neighborhood, UpdateUserPayload } from "../../types/user";

const PROGRESS_BAR_PROMPT =
  "Próximo sprint: conectar este checklist con la barra de progreso usando el manual de puntajes del backend y los endpoints que ya tenemos documentados.";

type SelectionType = "department" | "city" | "neighborhood";

type EditForm = {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  location: string;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
};

const formatLabel = (label?: string | null, fallback: string = "No disponible") =>
  label && label !== "" ? label : fallback;

const formatGenderValue = (gender?: Gender | string | null) => {
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
      className="p-4 rounded-2xl border mb-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <Text className="text-xs uppercase tracking-[2px] text-muted-foreground font-conviven mb-2">
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
      className="rounded-2xl px-4 py-3 mb-4"
      style={{ backgroundColor: accent }}
      onPress={onEdit}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-conviven-semibold" style={{ color: textColor }}>
            {label}
          </Text>
          <Text className="text-xs font-conviven mt-1" style={{ color: `${textColor}cc` }}>
            {description}
          </Text>
        </View>
        <Feather name="edit-3" size={18} color={textColor} />
      </View>
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
  const background = tone === "success" ? `${colors.conviven.blue}18` : `${colors.conviven.orange}20`;
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
    <View className="mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name={icon} size={18} color={colors.conviven.blue} />
          <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        </View>
        <Text className="text-sm font-conviven-semibold text-foreground">{width}%</Text>
      </View>
      <View className="h-1.5 rounded-full mt-2" style={{ backgroundColor: `${colors.conviven.blue}16` }}>
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
      className="border rounded-2xl px-4 py-3 mb-2.5"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start gap-3 flex-1 pr-4">
          <View className="w-9 h-9 rounded-2xl items-center justify-center" style={{ backgroundColor: `${colors.conviven.orange}15` }}>
            <MaterialCommunityIcons name={icon} size={20} color={colors.conviven.orange} />
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
      className="border rounded-2xl px-3.5 py-3 flex-row items-center gap-3"
      style={{ borderColor: colors.border }}
    >
      <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.conviven.blue}12` }}>
        <Feather name={icon} size={18} color={colors.conviven.blue} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
      <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
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
      className="flex-row items-start gap-3 px-3.5 py-3 rounded-2xl"
      style={{ backgroundColor: background }}
    >
      <View className="mt-[2px]">
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-conviven-semibold text-foreground">{label}</Text>
        <Text className="text-xs font-conviven text-muted-foreground mt-1 leading-4">{helper}</Text>
      </View>
    </View>
  );
};

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  options: {
    id: string;
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    helper?: string;
    onPress: () => void;
  }[];
}

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, options }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="w-[90%] self-center"
          style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.conviven.blue}12` }}
                >
                  <Feather name={option.icon} size={18} color={colors.conviven.blue} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-conviven-semibold text-foreground">{option.label}</Text>
                  {option.helper ? (
                    <Text className="text-xs font-conviven text-muted-foreground mt-0.5">{option.helper}</Text>
                  ) : null}
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface SelectionModalProps {
  visible: boolean;
  title: string;
  items: { id: string; label: string; helper?: string }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ visible, title, items, selectedId, onSelect, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="w-[90%] max-h-[70%] self-center"
          style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text className="text-sm font-conviven-semibold text-foreground mb-3">{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map(item => {
              const active = item.id === selectedId;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text
                      className="text-sm font-conviven-semibold"
                      style={{ color: active ? colors.conviven.blue : colors.foreground }}
                    >
                      {item.label}
                    </Text>
                    {item.helper ? (
                      <Text className="text-xs font-conviven text-muted-foreground mt-0.5">{item.helper}</Text>
                    ) : null}
                  </View>
                  {active ? <Feather name="check" size={18} color={colors.conviven.blue} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, multiline }) => {
  const { colors } = useTheme();

  const dynamicInputStyle = React.useMemo(
    () => ({
      borderColor: colors.border,
      color: colors.foreground,
      minHeight: multiline ? 88 : 44,
      textAlignVertical: multiline ? "top" : "center",
    }),
    [colors.border, colors.foreground, multiline],
  );

  return (
    <View className="mb-3">
      <Text className="text-xs font-conviven text-muted-foreground mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={[styles.input, dynamicInputStyle]}
      />
    </View>
  );
};

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  form: EditForm;
  onChange: <K extends keyof EditForm>(field: K, value: EditForm[K]) => void;
  onSubmit: () => void;
  saving: boolean;
  catalogLoading: boolean;
  onOpenSelector: (type: SelectionType) => void;
  locationLabels: {
    department: string;
    city: string;
    neighborhood: string;
  };
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  catalogLoading,
  onOpenSelector,
  locationLabels,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            onPress={() => {}}
            className="w-[94%] max-h-[90%] self-center"
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-conviven-semibold text-foreground">Editar perfil</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField
                label="Nombre"
                value={form.firstName}
                onChange={text => onChange("firstName", text)}
                placeholder="Tu nombre"
              />
              <InputField
                label="Apellido"
                value={form.lastName}
                onChange={text => onChange("lastName", text)}
                placeholder="Tu apellido"
              />
              <InputField
                label="Teléfono"
                value={form.phone}
                onChange={text => onChange("phone", text)}
                placeholder="Número de contacto"
              />
              <InputField
                label="Bio"
                value={form.bio}
                onChange={text => onChange("bio", text)}
                placeholder="Contá algo sobre ti"
                multiline
              />
              <InputField
                label="Referencia de ubicación"
                value={form.location}
                onChange={text => onChange("location", text)}
                placeholder="Ej: Cerca del Parque Rodó"
              />

              <Text className="text-xs font-conviven text-muted-foreground mb-1">Departamento</Text>
              <SelectorChip label={locationLabels.department} onPress={() => onOpenSelector("department")} />
              <Text className="text-xs font-conviven text-muted-foreground mt-3 mb-1">Ciudad</Text>
              <SelectorChip label={locationLabels.city} onPress={() => onOpenSelector("city")} />
              <Text className="text-xs font-conviven text-muted-foreground mt-3 mb-1">Barrio</Text>
              <SelectorChip label={locationLabels.neighborhood} onPress={() => onOpenSelector("neighborhood")} />
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-full border"
                style={{ borderColor: colors.border }}
                disabled={saving}
              >
                <Text className="text-sm font-conviven-semibold text-center" style={{ color: colors.mutedForeground }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSubmit}
                className="flex-1 py-3 rounded-full"
                style={{ backgroundColor: colors.conviven.blue }}
                disabled={saving}
              >
                {saving || catalogLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-conviven-semibold text-center text-white">Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const SelectorChip = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-between px-3 py-2 rounded-2xl border mb-1"
      style={{ borderColor: colors.border }}
    >
      <Text className="text-sm font-conviven text-foreground flex-1" numberOfLines={1}>
        {label}
      </Text>
      <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, setUser, refreshUser, updateUser } = useAuth();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [locationLabels, setLocationLabels] = useState({
    department: "Seleccioná un departamento",
    city: "Seleccioná una ciudad",
    neighborhood: "Seleccioná un barrio",
  });
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    location: "",
    departmentId: "",
    cityId: "",
    neighborhoodId: "",
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cleanliness: true,
  });

  useEffect(() => {
    if (!user || editVisible) {
      return;
    }

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      departmentId: user.departmentId ?? "",
      cityId: user.cityId ?? "",
      neighborhoodId: user.neighborhoodId ?? "",
    });
  }, [user, editVisible]);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      if (!user) {
        return;
      }

      try {
        if (user.neighborhoodId) {
          const neighborhood = await LocationService.getNeighborhood(user.neighborhoodId);
          if (!isMounted) {
            return;
          }

          const departmentName =
            neighborhood.city?.department?.name ??
            user.departmentName ??
            (neighborhood.city?.department ? neighborhood.city.department.name : undefined);
          const cityName = neighborhood.city?.name ?? user.cityName;
          const neighborhoodName = neighborhood.name ?? user.neighborhoodName;

          setLocationLabels({
            department: formatLabel(departmentName, "Seleccioná un departamento"),
            city: formatLabel(cityName, "Seleccioná una ciudad"),
            neighborhood: formatLabel(neighborhoodName, "Seleccioná un barrio"),
          });

          if (!editVisible) {
            setForm(prev => ({
              ...prev,
              departmentId:
                neighborhood.city?.department?.id ??
                neighborhood.city?.departmentId ??
                prev.departmentId,
              cityId: neighborhood.city?.id ?? prev.cityId,
              neighborhoodId: neighborhood.id ?? prev.neighborhoodId,
            }));
          }

          if ((!user.cityId || !user.cityName) && neighborhood.city?.id) {
            await updateUser({ cityId: neighborhood.city.id, cityName: neighborhood.city.name });
          }
        } else if (user.departmentId) {
          const department = await LocationService.getDepartment(user.departmentId);
          if (!isMounted) {
            return;
          }

          setLocationLabels(prev => ({
            department: formatLabel(department.name, prev.department),
            city: formatLabel(user.cityName, prev.city),
            neighborhood: formatLabel(user.neighborhoodName, prev.neighborhood),
          }));

          if (!editVisible) {
            setForm(prev => ({
              ...prev,
              departmentId: department.id,
            }));
          }
        }
      } catch (error) {
        console.error("Location fetch error", error);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, [
    user?.neighborhoodId,
    user?.departmentId,
    user?.cityId,
    user?.cityName,
    user?.neighborhoodName,
    editVisible,
    updateUser,
  ]);

  const toggleSection = useCallback(
    (sectionId: string) => {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: !prev[sectionId],
      }));
    },
    [],
  );

  const name = useMemo(
    () => user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sin nombre"),
    [user?.firstName, user?.lastName, user?.name],
  );

  const heroMessage = useMemo(() => {
    const neighborhood =
      locationLabels.neighborhood !== "Seleccioná un barrio"
        ? locationLabels.neighborhood
        : formatLabel(user?.neighborhoodName ?? user?.neighborhoodId, "tu zona");
    return `Busquemos el match ideal en ${neighborhood}`;
  }, [locationLabels.neighborhood, user?.neighborhoodId, user?.neighborhoodName]);

  const searchStatusMeta = useMemo(() => {
    const rawStatus = (user?.searchStatus ?? user?.status ?? "active").toString().toLowerCase();

    if (rawStatus.includes("pause") || rawStatus.includes("paus")) {
      return {
        label: "Búsqueda en pausa",
        description: "Toca para reactivar o ajustar tu disponibilidad",
        accent: `${colors.muted}dd`,
        textColor: colors.foreground,
      };
    }

    if (rawStatus.includes("match") || rawStatus.includes("activo")) {
      return {
        label: "Buscando roomie",
        description: "Estamos acercándote perfiles alineados a tu estilo",
        accent: `${colors.conviven.blue}d8`,
        textColor: "#ffffff",
      };
    }

    return {
      label: "Explorando opciones",
      description: "Actualiza preferencias para lograr conexiones rápidas",
      accent: `${colors.conviven.orange}d8`,
      textColor: colors.foreground,
    };
  }, [colors.conviven.blue, colors.conviven.orange, colors.foreground, colors.muted, user?.searchStatus, user?.status]);

  const lifestyleBadges = useMemo(
    () => [
      formatLabel(user?.profession ?? user?.jobTitle, "Team orden"),
      formatLabel(user?.petFriendly ? "Pet friendly" : undefined, "Buen roomie"),
      formatLabel(user?.hobby, "Espacios chill"),
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
        title: "Limpieza",
        summary:
          user?.roommatePreferences?.cleanlinessLevel ??
          "Contá con qué frecuencia te gusta ordenar los espacios",
        details:
          user?.roommatePreferences?.cleanlinessLevel ??
          "¿Sábado de limpieza intensa o mini rutinas diarias?",
      },
      {
        id: "schedules",
        icon: "clock-outline" as const,
        title: "Horarios",
        summary:
          user?.roommatePreferences?.schedules ??
          "¿Team mañanas, nocturno o mixto?",
        details:
          user?.roommatePreferences?.schedules ??
          "Compartí tus horarios de trabajo/estudio para coordinar mejor",
      },
      {
        id: "pets",
        icon: "paw" as const,
        title: "Mascotas",
        summary:
          user?.roommatePreferences?.petsPolicy ??
          (user?.petFriendly ? "Amo convivir con mascotas" : "Define tu política pet friendly"),
        details:
          user?.roommatePreferences?.petsPolicy ??
          "Contá si vivís con mascotas y cómo organizan el espacio",
      },
      {
        id: "guests",
        icon: "account-heart-outline" as const,
        title: "Visitas",
        summary:
          user?.roommatePreferences?.guestsPolicy ??
          "Explicá cómo te gusta recibir visitas",
        details:
          user?.roommatePreferences?.guestsPolicy ??
          "¿Juntadas frecuentes o momentos puntuales?",
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
          description: "Tu bio transmite buena vibra. Suma detalles para destacar",
        },
        {
          id: "trust",
          icon: "shield" as const,
          label: "Confianza",
          value: reliabilityScore,
          description: "Completar tu perfil eleva tu posición en la comunidad",
        },
        {
          id: "references",
          icon: "message-circle" as const,
          label: "Referencias",
          value: referencesScore,
          description: "Pedir reseñas acelera la elección del match",
        },
      ];
    },
    [user?.reliabilityScore, user?.verificationStatus?.references],
  );

  const checklistItems = useMemo(
    () => [
      {
        id: "photo",
        label: "Actualiza tu foto",
        helper: "Una imagen reciente genera confianza inmediata",
        completed: Boolean(user?.avatar),
      },
      {
        id: "bio",
        label: "Completa tu bio",
        helper: "Unas líneas sinceras ayudan a conectar",
        completed: Boolean(user?.bio && user.bio.length > 40),
      },
      {
        id: "prefs",
        label: "Define tus preferencias",
        helper: "Alineá expectativas para matches claros",
        completed: Boolean(user?.roommatePreferences),
      },
      {
        id: "location",
        label: "Confirma tu locación",
        helper: "Seleccioná departamento, ciudad y barrio",
        completed: Boolean(user?.neighborhoodId && locationLabels.neighborhood !== "Seleccioná un barrio"),
      },
    ],
    [locationLabels.neighborhood, user?.avatar, user?.bio, user?.neighborhoodId, user?.roommatePreferences],
  );

  const checklistProgress = useMemo(() => {
    const completed = checklistItems.filter(item => item.completed).length;
    return {
      completed,
      total: checklistItems.length,
    };
  }, [checklistItems]);

  const openEditModal = useCallback(async () => {
    if (!user) {
      return;
    }

    setEditVisible(true);
    setCatalogLoading(true);

    try {
      const [deptList, cityList, neighborhoodList] = await Promise.all([
        LocationService.listDepartments(),
        form.departmentId ? LocationService.listCities(form.departmentId) : Promise.resolve([] as City[]),
        form.cityId ? LocationService.listNeighborhoods(form.cityId) : Promise.resolve([] as Neighborhood[]),
      ]);

      setDepartments(deptList);
      setCities(cityList);
      setNeighborhoods(neighborhoodList);

      const departmentName =
        deptList.find(dept => dept.id === (form.departmentId || user.departmentId))?.name ??
        locationLabels.department;
      const cityName =
        cityList.find(city => city.id === (form.cityId || user.cityId))?.name ?? locationLabels.city;
      const neighborhoodName =
        neighborhoodList.find(neigh => neigh.id === (form.neighborhoodId || user.neighborhoodId))?.name ??
        locationLabels.neighborhood;

      setLocationLabels({
        department: formatLabel(departmentName, locationLabels.department),
        city: formatLabel(cityName, locationLabels.city),
        neighborhood: formatLabel(neighborhoodName, locationLabels.neighborhood),
      });
    } catch (error) {
      console.error("Catalog load error", error);
      Alert.alert("Ubicaciones", "No pudimos cargar las ubicaciones. Intenta nuevamente más tarde.");
    } finally {
      setCatalogLoading(false);
    }
  }, [form.cityId, form.departmentId, form.neighborhoodId, locationLabels.city, locationLabels.department, locationLabels.neighborhood, user]);

  const handleMenuOption = useCallback(
    (optionId: string) => {
      switch (optionId) {
        case "edit":
          openEditModal();
          break;
        case "settings":
          router.push("/(app)/settings");
          break;
        case "refresh":
          refreshUser();
          break;
        default:
          break;
      }
    },
    [openEditModal, refreshUser, router],
  );

  const menuOptions = useMemo(
    () => [
      {
        id: "edit",
        label: "Editar perfil",
        icon: "edit-3" as const,
        helper: "Nombre, bio y ubicación",
        onPress: () => handleMenuOption("edit"),
      },
      {
        id: "settings",
        label: "Ir a ajustes",
        icon: "settings" as const,
        helper: "Notificaciones y seguridad",
        onPress: () => handleMenuOption("settings"),
      },
      {
        id: "refresh",
        label: "Sincronizar datos",
        icon: "refresh-ccw" as const,
        helper: "Trae la info más reciente",
        onPress: () => handleMenuOption("refresh"),
      },
    ],
    [handleMenuOption],
  );

  const quickActions = useMemo(
    () => [
      {
        id: "share",
        icon: "share-2" as const,
        label: "Compartir perfil",
        helper: "Envía tu perfil a amigxs que quieran recomendarte",
        action: () =>
          Share.share({
            message: `Busco roomie en Conviven, este es mi perfil: ${user?.email ?? "conoce Conviven"}`,
          }).catch(() => undefined),
      },
      {
        id: "references",
        icon: "users" as const,
        label: "Pedir referencias",
        helper: "Solicita reseñas a roomies anteriores",
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
        helper: "Abrí el editor para ajustar tu vibe",
        action: () => openEditModal(),
      },
    ],
    [openEditModal, user?.email],
  );

  const updateLocationLabels = useCallback(
    (type: SelectionType, id: string) => {
      if (type === "department") {
        const department = departments.find(dept => dept.id === id);
        setLocationLabels(prev => ({
          ...prev,
          department: formatLabel(department?.name, prev.department),
          city: "Seleccioná una ciudad",
          neighborhood: "Seleccioná un barrio",
        }));
      }

      if (type === "city") {
        const city = cities.find(item => item.id === id);
        setLocationLabels(prev => ({
          ...prev,
          city: formatLabel(city?.name, prev.city),
          neighborhood: "Seleccioná un barrio",
        }));
      }

      if (type === "neighborhood") {
        const neighborhood = neighborhoods.find(item => item.id === id);
        setLocationLabels(prev => ({
          ...prev,
          neighborhood: formatLabel(neighborhood?.name, prev.neighborhood),
        }));
      }
    },
    [cities, departments, neighborhoods],
  );

  const handleSelect = useCallback(
    async (type: SelectionType, id: string) => {
      if (type === "department") {
        setForm(prev => ({ ...prev, departmentId: id, cityId: "", neighborhoodId: "" }));
        updateLocationLabels(type, id);
        setCatalogLoading(true);
        try {
          const cityList = await LocationService.listCities(id);
          setCities(cityList);
          setNeighborhoods([]);
        } catch (error) {
          console.error("City load error", error);
          Alert.alert("Ciudades", "No pudimos cargar las ciudades. Intenta nuevamente.");
        } finally {
          setCatalogLoading(false);
        }
        return;
      }

      if (type === "city") {
        setForm(prev => ({ ...prev, cityId: id, neighborhoodId: "" }));
        updateLocationLabels(type, id);
        setCatalogLoading(true);
        try {
          const neighborhoodList = await LocationService.listNeighborhoods(id);
          setNeighborhoods(neighborhoodList);
        } catch (error) {
          console.error("Neighborhood load error", error);
          Alert.alert("Barrios", "No pudimos cargar los barrios. Intenta nuevamente.");
        } finally {
          setCatalogLoading(false);
        }
        return;
      }

      setForm(prev => ({ ...prev, neighborhoodId: id }));
      updateLocationLabels(type, id);
    },
    [updateLocationLabels],
  );

  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    setSavingProfile(true);

    const payload: UpdateUserPayload = {
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      bio: form.bio.trim() || undefined,
      location: form.location.trim() || undefined,
      departmentId: form.departmentId || undefined,
      neighborhoodId: form.neighborhoodId || undefined,
    };

    try {
      const updatedUser = await UserService.update(user.id, payload);
      await setUser(updatedUser);
      setEditVisible(false);
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    } catch (error) {
      console.error("Update profile error", error);
      Alert.alert("Perfil", "No pudimos guardar los cambios. Intenta nuevamente.");
    } finally {
      setSavingProfile(false);
    }
  }, [form.bio, form.departmentId, form.firstName, form.lastName, form.location, form.neighborhoodId, form.phone, setUser, user]);

  const handleAvatarUpdate = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permisos", "Necesitamos acceso a tu galería para actualizar la foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setPhotoUploading(true);

      const updatedUser = await UserService.updateAvatar(user.id, {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });

      await setUser(updatedUser);
      Alert.alert("Foto actualizada", "Tu foto de perfil se actualizó correctamente.");
    } catch (error) {
      console.error("Avatar update error", error);
      Alert.alert("Foto", "No pudimos actualizar tu foto. Intenta nuevamente.");
    } finally {
      setPhotoUploading(false);
    }
  }, [setUser, user]);

  const handleSelectionOpen = useCallback(
    (type: SelectionType) => {
      if (type === "city" && !form.departmentId) {
        Alert.alert("Ubicación", "Selecciona primero un departamento.");
        return;
      }

      if (type === "neighborhood" && !form.cityId) {
        Alert.alert("Ubicación", "Selecciona primero una ciudad.");
        return;
      }

      setSelectionType(type);
    },
    [form.cityId, form.departmentId],
  );

  const selectionItems = useMemo(() => {
    if (selectionType === "department") {
      return departments.map(dept => ({ id: dept.id, label: dept.name }));
    }

    if (selectionType === "city") {
      return cities.map(city => ({
        id: city.id,
        label: city.name,
        helper: departments.find(dept => dept.id === city.departmentId)?.name,
      }));
    }

    if (selectionType === "neighborhood") {
      return neighborhoods.map(neigh => ({
        id: neigh.id,
        label: neigh.name,
        helper: cities.find(city => city.id === neigh.cityId)?.name,
      }));
    }

    return [];
  }, [cities, departments, neighborhoods, selectionType]);

  const selectedId = useMemo(() => {
    if (selectionType === "department") {
      return form.departmentId;
    }
    if (selectionType === "city") {
      return form.cityId;
    }
    if (selectionType === "neighborhood") {
      return form.neighborhoodId;
    }
    return undefined;
  }, [form.cityId, form.departmentId, form.neighborhoodId, selectionType]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.conviven.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const locationTags = [
    locationLabels.department,
    locationLabels.city,
    locationLabels.neighborhood,
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          className="border rounded-3xl p-4 mb-4"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <View className="flex-row items-start justify-between">
            <Pressable onPress={handleAvatarUpdate} className="mr-3">
              <View
                className="w-16 h-16 rounded-2xl overflow-hidden items-center justify-center"
                style={{ backgroundColor: colors.muted }}
              >
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} className="w-full h-full" resizeMode="cover" />
                ) : photoUploading ? (
                  <ActivityIndicator color={colors.conviven.blue} />
                ) : (
                  <Feather name="camera" size={22} color={colors.mutedForeground} />
                )}
                {photoUploading ? (
                  <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <ActivityIndicator color="#ffffff" />
                  </View>
                ) : null}
              </View>
            </Pressable>
            <View className="flex-1">
              <Text className="text-sm font-conviven text-muted-foreground">Hola,</Text>
              <Text className="text-xl font-conviven-bold text-foreground mt-1">{name}</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {locationTags.map(tag => (
                  <View
                    key={tag}
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${colors.conviven.blue}12` }}
                  >
                    <Text className="text-[11px] font-conviven-semibold" style={{ color: colors.conviven.blue }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Feather name="more-vertical" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text className="text-sm font-conviven text-muted-foreground mt-3">{heroMessage}</Text>
        </View>

        <StatusBanner
          label={searchStatusMeta.label}
          description={searchStatusMeta.description}
          accent={searchStatusMeta.accent}
          textColor={searchStatusMeta.textColor}
          onEdit={() => setEditVisible(true)}
        />

        <Section title="Confianza & verificación">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1"
            contentContainerStyle={styles.verificationScrollContent}
          >
            {verificationBadges.map(badge => (
              <View key={badge.label} className="mr-2 mb-2">
                <VerificationPill icon={badge.icon} label={badge.label} tone={badge.tone} />
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="Datos personales">
          <View className="gap-3">
            <InfoRow label="Nombre completo" value={name} />
            <InfoRow label="Fecha de nacimiento" value={formatLabel(user.birthDate)} />
            <InfoRow label="Género" value={formatLabel(formatGenderValue(user.gender))} />
            <InfoRow label="Teléfono" value={formatLabel(user.phone)} />
          </View>
        </Section>

        <Section title="Ubicación y comunidad">
          <View className="gap-3">
            <InfoRow label="Departamento" value={locationLabels.department} />
            <InfoRow label="Ciudad" value={locationLabels.city} />
            <InfoRow label="Barrio" value={locationLabels.neighborhood} />
            <InfoRow label="Referencia" value={formatLabel(user.location)} />
          </View>
        </Section>

        <Section title="Preferencias de convivencia">
          <Text className="text-xs font-conviven text-muted-foreground mb-3">
            Abrí cada bloque para alinear expectativas rápido.
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

        <Section title="Señales de match">
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
          <Text className="text-xs font-conviven text-muted-foreground mb-3">
            ¡Llevas {checklistProgress.completed} de {checklistProgress.total} pasos completados!
          </Text>
          <View className="gap-3">
            {checklistItems.map(item => (
              <ChecklistItem key={item.id} label={item.label} helper={item.helper} completed={item.completed} />
            ))}
          </View>
          <Text className="text-xs font-conviven text-muted-foreground mt-3 italic">{PROGRESS_BAR_PROMPT}</Text>
        </Section>

        <Section title="Sobre ti">
          <Text className="text-sm font-conviven text-foreground leading-5">
            {formatLabel(
              user.bio,
              "Cuéntale al mundo cómo eres, qué te gusta y qué buscas en un roomie.",
            )}
          </Text>
        </Section>

        <Section title="Tu vibe">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRowContent}
          >
            {lifestyleBadges.map((badge, index) => (
              <View key={`${badge}-${index}`} style={styles.badgeSpacing}>
                <QuickBadge label={badge} />
              </View>
            ))}
          </ScrollView>
        </Section>
      </ScrollView>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} options={menuOptions} />
      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        form={form}
        onChange={(field, value) => setForm(prev => ({ ...prev, [field]: value }))}
        onSubmit={handleSaveProfile}
        saving={savingProfile}
        catalogLoading={catalogLoading}
        onOpenSelector={handleSelectionOpen}
        locationLabels={locationLabels}
      />
      <SelectionModal
        visible={selectionType !== null}
        onClose={() => setSelectionType(null)}
        title={
          selectionType === "department"
            ? "Seleccioná un departamento"
            : selectionType === "city"
              ? "Seleccioná una ciudad"
              : "Seleccioná un barrio"
        }
        items={selectionItems}
        selectedId={selectedId}
        onSelect={id => {
          if (selectionType) {
            handleSelect(selectionType, id);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 16,
  },
  verificationScrollContent: {
    paddingHorizontal: 4,
  },
  badgeRowContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  badgeSpacing: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    fontFamily: "Conviven-Regular",
    fontSize: 14,
  },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-start gap-3">
      <Text className="text-xs font-conviven text-muted-foreground w-28">{label}</Text>
      <Text className="text-sm font-conviven-semibold text-foreground flex-1" style={{ color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

// PROGRESS BAR NEXT ITERATION PROMPT:
// Cuando tengas el manual de puntajes del backend, conecta el estado del checklist con una barra
// de progreso visual que consuma esos endpoints para mostrar el avance en tiempo real.
