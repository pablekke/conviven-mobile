// UserInfoCard.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from "react-native";

// =====================
// Tipos (mismos que RN original)
// =====================
interface Profile {
  bio: string;
  occupation?: string;
  education?: string;
  tidiness?: string;
  schedule?: string;
  guestsFreq?: string;
  musicUsage?: string;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  petsOwned?: readonly string[];
  petsOk?: string;
  cooking?: string;
  diet?: string;
  sharePolicy?: string;
  languages?: readonly string[];
  interests?: readonly string[];
  smokesCigarettes?: string;
  smokesWeed?: string;
  alcohol?: string;
}

interface Location {
  neighborhood: { name: string };
  city: { name: string };
  department: { name: string };
}

interface Filters {
  mainPreferredLocation: Location;
  preferredLocations: readonly Location[];
}

interface UserInfoCardProps {
  profile: Profile;
  location: Location;
  filters: Filters;
  budgetFull: string;
  style?: ViewStyle;
}

// =====================
// Mappers (labels)
// =====================
const t = {
  tidiness: (v?: string) =>
    (({ NEAT: "Ordenada", AVERAGE: "Normal", MESSY: "Desprolija" }) as const)[v ?? "AVERAGE"] ??
    "—",
  schedule: (v?: string) =>
    (({ DAY: "Diurna", NIGHT: "Nocturna", MIXED: "Horarios mixtos" }) as const)[v ?? "MIXED"] ??
    "—",
  guests: (v?: string) =>
    (({ NEVER: "Sin visitas", RARELY: "Visitas raras", OFTEN: "Visitas frecuentes" }) as const)[
      v ?? "RARELY"
    ] ?? "—",
  music: (v?: string) =>
    (
      ({
        HEADPHONES: "Auris",
        SPEAKER_DAY: "Parlante día",
        SPEAKER_NIGHT: "Parlante noche",
      }) as const
    )[v ?? "SPEAKER_DAY"] ?? "—",
  cigs: (v?: string) =>
    (({ NEVER: "No fuma", SOCIALLY: "Fuma social", REGULAR: "Fuma" }) as const)[v ?? "NEVER"] ??
    "—",
  weed: (v?: string) =>
    (({ NEVER: "Weed: nunca", SOCIALLY: "Weed social", REGULAR: "Weed regular" }) as const)[
      v ?? "NEVER"
    ] ?? "—",
  alcohol: (v?: string) =>
    (
      ({ NEVER: "Alcohol: nunca", SOCIALLY: "Alcohol social", REGULAR: "Alcohol regular" }) as const
    )[v ?? "NEVER"] ?? "—",
  petsOk: (v?: string) =>
    (({ DOGS_OK: "Perros ok", CATS_OK: "Gatos ok", NONE: "Sin mascotas" }) as const)[v ?? "NONE"] ??
    "—",
  cooking: (v?: string) =>
    (({ NEVER: "Cocina poco", SOMETIMES: "Cocina a veces", OFTEN: "Cocina seguido" }) as const)[
      v ?? "SOMETIMES"
    ] ?? "—",
  diet: (v?: string) =>
    (({ OMNIVORE: "Omnívora", VEGETARIAN: "Vegetariana", VEGAN: "Vegana" }) as const)[
      v ?? "OMNIVORE"
    ] ?? "—",
  share: (v?: string) =>
    (
      ({
        RELAXED: "Compartir flexible",
        NORMAL: "Compartir normal",
        STRICT: "Compartir estricto",
      }) as const
    )[v ?? "NORMAL"] ?? "—",
};

// =====================
// Helpers UI (chips, banderas, etc.)
// =====================
const Flag = (name: string) => {
  const k = name.toLowerCase();
  if (/(español|spanish)/.test(k)) return "🇪🇸";
  if (/inglés|english/.test(k)) return "🇬🇧";
  if (/portugu(és|ese)/.test(k)) return "🇵🇹";
  if (/franc(és|h)/.test(k)) return "🇫🇷";
  if (/alem(án|an)/.test(k)) return "🇩🇪";
  if (/ital(iano|ian)/.test(k)) return "🇮🇹";
  return "🏳️";
};

const Chip = ({ label, subtle }: { label: string; subtle?: boolean }) => (
  <View style={[styles.chip, subtle && styles.chipSubtle]}>
    <Text style={[styles.chipText, subtle && styles.chipTextSubtle]}>{label}</Text>
  </View>
);

const BoolPill = ({
  yes,
  yesLabel,
  noLabel,
}: {
  yes: boolean;
  yesLabel: string;
  noLabel: string;
}) => (
  <View style={[styles.pill, yes ? styles.pillYes : styles.pillNo]}>
    <Text style={[styles.pillText, yes ? styles.pillTextYes : styles.pillTextNo]}>
      {yes ? "✔️ " : "✖️ "}
      {yes ? yesLabel : noLabel}
    </Text>
  </View>
);

const QuietHours = ({ start, end }: { start: number; end: number }) => {
  const ss = String(start).padStart(2, "0");
  const ee = String(end).padStart(2, "0");
  return (
    <View style={styles.quiet}>
      <Text style={styles.quietText}>
        🌙 Tranquila {ss}–{ee}h
      </Text>
    </View>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionTitleText}>{children}</Text>
  </View>
);

// =====================
// Componente principal
// =====================
export function UserInfoCard({ profile, location, filters, budgetFull, style }: UserInfoCardProps) {
  const hasDog = (profile.petsOwned ?? []).some(p => /perro|dog/i.test(p));
  const hasCat = (profile.petsOwned ?? []).some(p => /gato|cat/i.test(p));

  return (
    <ScrollView contentContainerStyle={styles.screen} bounces>
      <View style={[styles.card, style]}>
        {/* Fondo sutil (simulado) */}
        <View style={styles.bgOverlay} />

        {/* Header integrado */}
        <View style={styles.header}>
          <Text style={styles.headerKicker}>Sobre mí</Text>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetKicker}>Presupuesto</Text>
            <Text style={styles.budgetValue}>{budgetFull}</Text>
          </View>
        </View>

        <View style={styles.bioBox}>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Chips rápidos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChips}
        >
          <Chip label={`☀️ ${t.schedule(profile.schedule)}`} subtle />
          <QuietHours start={profile.quietHoursStart ?? 22} end={profile.quietHoursEnd ?? 7} />
          <Chip label={t.tidiness(profile.tidiness)} />
          <Chip label={t.guests(profile.guestsFreq)} />
          <Chip label={t.share(profile.sharePolicy)} />
          <Chip label={`🎵 ${t.music(profile.musicUsage)}`} />
        </ScrollView>

        {/* Ubicación */}
        <SectionTitle>Ubicación</SectionTitle>
        <View style={styles.rowBlock}>
          <Row label="Actual" value={`${location.neighborhood.name}, ${location.city.name}`} />
          <Row
            label="Preferencia principal"
            value={`${filters.mainPreferredLocation.department.name} · ${filters.mainPreferredLocation.city.name} · ${filters.mainPreferredLocation.neighborhood.name}`}
          />
          {filters.preferredLocations?.length ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Otras zonas</Text>
              <View style={styles.wrapChips}>
                {filters.preferredLocations.map((loc, i) => (
                  <View key={String(i)} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {loc.department.name} · {loc.city.name} · {loc.neighborhood.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Convivencia */}
        <SectionTitle>Convivencia</SectionTitle>
        <View style={styles.rowBlock}>
          <Row label="Visitas" value={t.guests(profile.guestsFreq)} />
          <Row label="Política de compartir" value={t.share(profile.sharePolicy)} />
          <Row label="Sonido" value={t.music(profile.musicUsage)} />
          <Row
            label="Rutina"
            value={
              <View style={styles.inlineChips}>
                <Chip label={t.schedule(profile.schedule)} subtle />
                <QuietHours
                  start={profile.quietHoursStart ?? 22}
                  end={profile.quietHoursEnd ?? 7}
                />
                <Chip label={t.tidiness(profile.tidiness)} />
              </View>
            }
          />
        </View>

        {/* Mascotas */}
        <SectionTitle>Mascotas</SectionTitle>
        <View style={styles.inlineChips}>
          <BoolPill yes={!!hasDog} yesLabel="Tiene perro" noLabel="Sin perro" />
          <BoolPill yes={!!hasCat} yesLabel="Tiene gato" noLabel="Sin gato" />
          <Chip label={`🐶 ${t.petsOk(profile.petsOk)}`} />
        </View>

        {/* Hábitos personales */}
        <SectionTitle>Hábitos personales</SectionTitle>
        <View style={styles.inlineChips}>
          <Chip label={`🚬 ${t.cigs(profile.smokesCigarettes)}`} />
          <Chip label={t.weed(profile.smokesWeed)} />
          <Chip label={t.alcohol(profile.alcohol)} />
          <Chip label={`👨‍🍳 ${t.cooking(profile.cooking)}`} />
          <Chip label={t.diet(profile.diet)} />
        </View>

        {/* Perfil */}
        <SectionTitle>Perfil</SectionTitle>
        <View style={styles.rowBlock}>
          <Row label="Ocupación" value={profile.occupation ?? "—"} />
          <Row label="Educación" value={profile.education ?? "—"} />
          <Row
            label="Idiomas"
            value={
              (profile.languages?.length ? (
                <View style={styles.wrapChips}>
                  {profile.languages.map((lng, i) => (
                    <View key={String(i)} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {Flag(lng)} {lng}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                "—"
              )) as any
            }
          />
          <Row
            label="Intereses"
            value={
              (profile.interests?.length ? (
                <View style={styles.wrapChips}>
                  {profile.interests.map((it, i) => (
                    <View key={String(i)} style={[styles.chip, styles.chipSubtle]}>
                      <Text style={[styles.chipText, styles.chipTextSubtle]}>{it}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                "—"
              )) as any
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

// =====================
// Row reutilizable
// =====================
function Row({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
}: {
  label: string;
  value: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}) {
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.rowLabel, labelStyle]}>{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
      ) : (
        <View>{value}</View>
      )}
    </View>
  );
}

// =====================
// Estilos
// =====================
const styles = StyleSheet.create({
  screen: {
    padding: 16,
    backgroundColor: "#F8FAFC", // slate-50
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE", // blue-100
    padding: 16,
    overflow: "hidden",
    // sombra suave
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerKicker: {
    color: "#1D4ED8", // blue-700
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingTop: 4,
  },
  budgetPill: {
    backgroundColor: "#2563EB", // blue-600
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  budgetKicker: {
    color: "white",
    fontSize: 10,
    opacity: 0.95,
    textTransform: "uppercase",
    textAlign: "center",
  },
  budgetValue: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
    marginTop: 2,
  },
  bioBox: {
    backgroundColor: "rgba(239, 246, 255, 0.7)", // blue-50/70
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  bioText: {
    color: "#0F172A", // slate-900
    fontSize: 15,
    lineHeight: 21,
  },
  quickChips: {
    paddingVertical: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#E2E8F0", // slate-200
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipSubtle: {
    backgroundColor: "rgba(239, 246, 255, 0.7)",
    borderColor: "#DBEAFE",
  },
  chipText: {
    color: "#334155", // slate-700
    fontSize: 12,
  },
  chipTextSubtle: {
    color: "#1D4ED8", // blue-700
    fontWeight: "600",
  },
  sectionTitleWrap: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionBar: {
    height: 2,
    backgroundColor: "rgba(59,130,246,0.6)",
    borderRadius: 999,
    marginBottom: 6,
  },
  sectionTitleText: {
    color: "#1E40AF", // blue-800
    fontWeight: "800",
    fontSize: 15,
  },
  rowBlock: {},
  row: {
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 11,
    color: "#64748B", // slate-500
    fontWeight: "600",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 14,
    color: "#0F172A", // slate-900
  },
  wrapChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  inlineChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 6,
  },
  pillYes: {
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    borderColor: "rgba(22, 163, 74, 0.28)",
  },
  pillNo: {
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    borderColor: "rgba(148, 163, 184, 0.32)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  pillTextYes: {
    color: "#166534",
  },
  pillTextNo: {
    color: "#475569",
  },
  quiet: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(14, 116, 144, 0.25)",
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    marginRight: 8,
    marginBottom: 6,
  },
  quietText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
});

// =====================
// Caso base (ejemplo de uso)
// =====================
export function ExampleBase() {
  const profile: Profile = {
    bio: "Soy desarrollador y fan de la cocina casera. Busco compartir en un ambiente tranquilo y ordenado.",
    occupation: "Desarrollador Full-Stack",
    education: "Ingeniería en Sistemas (UTEC)",
    tidiness: "NEAT",
    schedule: "DAY",
    guestsFreq: "RARELY",
    musicUsage: "HEADPHONES",
    quietHoursStart: 22,
    quietHoursEnd: 7,
    petsOwned: [],
    petsOk: "DOGS_OK",
    cooking: "OFTEN",
    diet: "OMNIVORE",
    sharePolicy: "NORMAL",
    languages: ["Español", "Inglés"],
    interests: ["Senderismo", "Tecnología", "Cocina"],
    smokesCigarettes: "NEVER",
    smokesWeed: "NEVER",
    alcohol: "SOCIALLY",
  };

  const location: Location = {
    neighborhood: { name: "Cordón" },
    city: { name: "Montevideo" },
    department: { name: "Montevideo" },
  };

  const filters: Filters = {
    mainPreferredLocation: {
      neighborhood: { name: "Parque Rodó" },
      city: { name: "Montevideo" },
      department: { name: "Montevideo" },
    },
    preferredLocations: [
      {
        neighborhood: { name: "Centro" },
        city: { name: "Montevideo" },
        department: { name: "Montevideo" },
      },
      {
        neighborhood: { name: "Pocitos" },
        city: { name: "Montevideo" },
        department: { name: "Montevideo" },
      },
    ],
  };

  return (
    <UserInfoCard
      profile={profile}
      location={location}
      filters={filters}
      budgetFull="$ 17.000 – 22.000 / mes"
    />
  );
}
