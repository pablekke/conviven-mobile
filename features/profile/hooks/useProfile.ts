import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { User } from "../../../types/user";
import LocationService from "../../../services/locationService";
import {
  ChecklistItem as ChecklistItemData,
  LocationLabels,
  MatchSignal as MatchSignalData,
  PreferenceSection,
  SearchStatusMeta,
  VerificationBadge,
} from "../types";
import { DEFAULT_LOCATION_LABELS, PROFILE_CONSTANTS } from "../constants";
import { formatLabel } from "../utils/formatters";

export interface UseProfileReturn {
  user: User | null;
  name: string;
  heroMessage: string;
  searchStatusMeta: SearchStatusMeta;
  lifestyleBadges: string[];
  verificationBadges: VerificationBadge[];
  preferenceSections: PreferenceSection[];
  matchSignals: MatchSignalData[];
  checklistItems: ChecklistItemData[];
  checklistProgress: { completed: number; total: number };
  expandedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  locationLabels: LocationLabels;
  locationTags: string[];
}

export const useProfile = (): UseProfileReturn => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cleanliness: true,
  });
  const [locationLabels, setLocationLabels] = useState<LocationLabels>(DEFAULT_LOCATION_LABELS);

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
            department: formatLabel(departmentName, DEFAULT_LOCATION_LABELS.department),
            city: formatLabel(cityName, DEFAULT_LOCATION_LABELS.city),
            neighborhood: formatLabel(neighborhoodName, DEFAULT_LOCATION_LABELS.neighborhood),
          });
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
  ]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const name = useMemo(
    () =>
      user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sin nombre"),
    [user?.firstName, user?.lastName, user?.name],
  );

  const heroMessage = useMemo(() => {
    const neighborhood =
      locationLabels.neighborhood !== DEFAULT_LOCATION_LABELS.neighborhood
        ? locationLabels.neighborhood
        : formatLabel(user?.neighborhoodName ?? user?.neighborhoodId, "tu zona");
    return `Busquemos el match ideal en ${neighborhood}`;
  }, [locationLabels.neighborhood, user?.neighborhoodId, user?.neighborhoodName]);

  const searchStatusMeta = useMemo((): SearchStatusMeta => {
    const rawStatus = (user?.searchStatus ?? user?.status ?? "active").toString().toLowerCase();

    if (rawStatus.includes("pause") || rawStatus.includes("paus")) {
      return {
        label: "Búsqueda en pausa",
        description: "Toca para reactivar o ajustar tu disponibilidad",
        accent: "#94A3B8dd",
        textColor: "#0F172A",
      };
    }

    if (rawStatus.includes("match") || rawStatus.includes("activo")) {
      return {
        label: "Buscando roomie",
        description: "Estamos acercándote perfiles alineados a tu estilo",
        accent: "#2563EBd8",
        textColor: "#ffffff",
      };
    }

    return {
      label: "Explorando opciones",
      description: "Actualiza preferencias para lograr conexiones rápidas",
      accent: "#F59E0Bd8",
      textColor: "#0F172A",
    };
  }, [user?.searchStatus, user?.status]);

  const lifestyleBadges = useMemo(
    () => [
      formatLabel(user?.profession ?? user?.jobTitle, "Team orden"),
      formatLabel(user?.petFriendly ? "Pet friendly" : undefined, "Buen roomie"),
      formatLabel(user?.hobby, "Espacios chill"),
    ],
    [user?.hobby, user?.petFriendly, user?.profession, user?.jobTitle],
  );

  const verificationBadges = useMemo((): VerificationBadge[] => {
    const verification = user?.verificationStatus;
    const trustLevel =
      verification?.reliabilityLevel ??
      (user?.reliabilityScore &&
      user.reliabilityScore >= PROFILE_CONSTANTS.RELIABILITY_TOP_THRESHOLD
        ? "Confianza top"
        : user?.reliabilityScore &&
            user.reliabilityScore >= PROFILE_CONSTANTS.RELIABILITY_GOOD_THRESHOLD
          ? "Roomie confiable"
          : "Confianza en construcción");

    return [
      {
        icon: "mail" as const,
        label: verification?.email ? "Email verificado" : "Verifica tu email",
        tone: (verification?.email ? "success" : "pending") as "success" | "pending",
      },
      {
        icon: "shield" as const,
        label: verification?.identity ? "Identidad confirmada" : "Documentos pendientes",
        tone: (verification?.identity ? "success" : "pending") as "success" | "pending",
      },
      {
        icon: "phone" as const,
        label: verification?.phone ? "Teléfono verificado" : "Suma tu teléfono",
        tone: (verification?.phone ? "success" : "pending") as "success" | "pending",
      },
      {
        icon: "users" as const,
        label: `Referencias (${verification?.references ?? 0})`,
        tone: (verification && verification.references > 0 ? "success" : "pending") as
          | "success"
          | "pending",
      },
      {
        icon: "award" as const,
        label: trustLevel ?? "Confianza en construcción",
        tone: (user?.reliabilityScore &&
        user.reliabilityScore >= PROFILE_CONSTANTS.RELIABILITY_GOOD_THRESHOLD
          ? "success"
          : "pending") as "success" | "pending",
      },
    ];
  }, [user?.reliabilityScore, user?.verificationStatus]);

  const preferenceSections = useMemo(
    (): PreferenceSection[] => [
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
        summary: user?.roommatePreferences?.schedules ?? "¿Team mañanas, nocturno o mixto?",
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
        summary: user?.roommatePreferences?.guestsPolicy ?? "Explicá cómo te gusta recibir visitas",
        details:
          user?.roommatePreferences?.guestsPolicy ?? "¿Juntadas frecuentes o momentos puntuales?",
      },
    ],
    [user?.petFriendly, user?.roommatePreferences],
  );

  const matchSignals = useMemo((): MatchSignalData[] => {
    const reliabilityScore = Math.min(Math.max(user?.reliabilityScore ?? 68, 0), 100);
    const referencesScore = Math.min(
      (user?.verificationStatus?.references ?? 0) * PROFILE_CONSTANTS.REFERENCES_INCREMENT +
        PROFILE_CONSTANTS.REFERENCES_BASE_SCORE,
      PROFILE_CONSTANTS.REFERENCES_MAX_SCORE,
    );
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
  }, [user?.reliabilityScore, user?.verificationStatus?.references]);

  const checklistItems = useMemo(
    (): ChecklistItemData[] => [
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
        completed: Boolean(user?.bio && user.bio.length > PROFILE_CONSTANTS.MIN_BIO_LENGTH),
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
        completed: Boolean(
          user?.neighborhoodId &&
            locationLabels.neighborhood !== DEFAULT_LOCATION_LABELS.neighborhood,
        ),
      },
    ],
    [
      locationLabels.neighborhood,
      user?.avatar,
      user?.bio,
      user?.neighborhoodId,
      user?.roommatePreferences,
    ],
  );

  const checklistProgress = useMemo(() => {
    const completed = checklistItems.filter(item => item.completed).length;
    return {
      completed,
      total: checklistItems.length,
    };
  }, [checklistItems]);

  const locationTags = useMemo(
    () => [locationLabels.department, locationLabels.city, locationLabels.neighborhood],
    [locationLabels],
  );

  return {
    user,
    name,
    heroMessage,
    searchStatusMeta,
    lifestyleBadges,
    verificationBadges,
    preferenceSections,
    matchSignals,
    checklistItems,
    checklistProgress,
    expandedSections,
    toggleSection,
    locationLabels,
    locationTags,
  };
};
