import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { User } from "../../../types/user";
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
    if (!user?.location) {
      setLocationLabels(DEFAULT_LOCATION_LABELS);
      return;
    }

    setLocationLabels({
      department: formatLabel(user.location.department?.name, DEFAULT_LOCATION_LABELS.department),
      city: formatLabel(user.location.city?.name, DEFAULT_LOCATION_LABELS.city),
      neighborhood: formatLabel(
        user.location.neighborhood?.name,
        DEFAULT_LOCATION_LABELS.neighborhood,
      ),
    });
  }, [user?.location]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const name = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sin nombre",
    [user?.firstName, user?.lastName],
  );

  const heroMessage = useMemo(() => {
    const neighborhood =
      locationLabels.neighborhood !== DEFAULT_LOCATION_LABELS.neighborhood
        ? locationLabels.neighborhood
        : formatLabel(user?.location?.neighborhood?.name, "tu zona");
    return `Busquemos el match ideal en ${neighborhood}`;
  }, [locationLabels.neighborhood, user?.location?.neighborhood?.name]);

  const searchStatusMeta = useMemo((): SearchStatusMeta => {
    const rawStatus = (user?.status ?? "active").toString().toLowerCase();

    if (rawStatus.includes("pause") || rawStatus.includes("paus")) {
      return {
        label: "Búsqueda en pausa",
        description: "Toca para reactivar o ajustar tu disponibilidad",
        accent: "#94A3B8dd",
        textColor: "#0F172A",
      };
    }

    if (rawStatus.includes("active") || rawStatus.includes("activo")) {
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
  }, [user?.status]);

  const lifestyleBadges = useMemo(
    () => [
      formatLabel(user?.profile?.occupation, "Tu ocupación"),
      formatLabel(user?.profile?.education, "Tu educación"),
      formatLabel(
        (user?.profile?.languages?.length ?? 0) > 0 ? "Idiomas cargados" : undefined,
        "Idiomas",
      ),
    ],
    [user?.profile?.occupation, user?.profile?.education, user?.profile?.languages?.length],
  );

  const verificationBadges = useMemo((): VerificationBadge[] => {
    return [];
  }, []);

  const preferenceSections = useMemo(
    (): PreferenceSection[] => [
      {
        id: "cleanliness",
        icon: "broom" as const,
        title: "Limpieza",
        summary:
          user?.profile?.tidiness ?? "Contá con qué frecuencia te gusta ordenar los espacios",
        details: user?.profile?.tidiness ?? "¿Sábado de limpieza intensa o mini rutinas diarias?",
      },
      {
        id: "schedules",
        icon: "clock-outline" as const,
        title: "Horarios",
        summary: user?.profile?.schedule ?? "¿Team mañanas, nocturno o mixto?",
        details:
          user?.profile?.schedule ??
          "Compartí tus horarios de trabajo/estudio para coordinar mejor",
      },
      {
        id: "pets",
        icon: "paw" as const,
        title: "Mascotas",
        summary: user?.profile?.petsOk ?? "Define tu política pet friendly",
        details: user?.profile?.petsOk ?? "Contá si vivís con mascotas y cómo organizan el espacio",
      },
      {
        id: "guests",
        icon: "account-heart-outline" as const,
        title: "Visitas",
        summary: user?.profile?.guestsFreq ?? "Explicá cómo te gusta recibir visitas",
        details: user?.profile?.guestsFreq ?? "¿Juntadas frecuentes o momentos puntuales?",
      },
    ],
    [
      user?.profile?.tidiness,
      user?.profile?.schedule,
      user?.profile?.petsOk,
      user?.profile?.guestsFreq,
    ],
  );

  const matchSignals = useMemo((): MatchSignalData[] => {
    const hasPhoto = Boolean(user?.photoUrl);
    const hasBio = Boolean(
      user?.profile?.bio && user.profile.bio.length > PROFILE_CONSTANTS.MIN_BIO_LENGTH,
    );
    const hasLocation = Boolean(user?.location?.neighborhood?.id);
    const hasPreferences = Boolean(user?.preferences);

    const completion = [hasPhoto, hasBio, hasLocation, hasPreferences].filter(Boolean).length;
    const vibeScore = 55 + completion * 10;
    const trustScore = 50 + completion * 12;

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
        value: trustScore,
        description: "Completar tu perfil eleva tu posición en la comunidad",
      },
      {
        id: "references",
        icon: "message-circle" as const,
        label: "Perfil",
        value: vibeScore,
        description: "Completar datos mejora tus matches",
      },
    ];
  }, [user?.location?.neighborhood?.id, user?.photoUrl, user?.preferences, user?.profile?.bio]);

  const checklistItems = useMemo(
    (): ChecklistItemData[] => [
      {
        id: "photo",
        label: "Actualiza tu foto",
        helper: "Una imagen reciente genera confianza inmediata",
        completed: Boolean(user?.photoUrl),
      },
      {
        id: "bio",
        label: "Completa tu bio",
        helper: "Unas líneas sinceras ayudan a conectar",
        completed: Boolean(
          user?.profile?.bio && user.profile.bio.length > PROFILE_CONSTANTS.MIN_BIO_LENGTH,
        ),
      },
      {
        id: "prefs",
        label: "Define tus preferencias",
        helper: "Alineá expectativas para matches claros",
        completed: Boolean(user?.preferences),
      },
      {
        id: "location",
        label: "Confirma tu locación",
        helper: "Seleccioná departamento, ciudad y barrio",
        completed: Boolean(
          user?.location?.neighborhood?.id &&
            locationLabels.neighborhood !== DEFAULT_LOCATION_LABELS.neighborhood,
        ),
      },
    ],
    [
      locationLabels.neighborhood,
      user?.photoUrl,
      user?.profile?.bio,
      user?.location?.neighborhood?.id,
      user?.preferences,
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
