import { View, Text, useWindowDimensions } from "react-native";
import { Row } from "./Row";

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
}

const t = {
  tidiness: (v?: string) =>
    (({ NEAT: "Ordenada", AVERAGE: "Normal", MESSY: "Desprolija" }) as const)[v ?? "AVERAGE"],
  schedule: (v?: string) =>
    (({ DAY: "Diurna", NIGHT: "Nocturna", MIXED: "Horarios mixtos" }) as const)[v ?? "MIXED"],
  guests: (v?: string) =>
    (({ NEVER: "Sin visitas", RARELY: "Visitas raras", OFTEN: "Visitas frecuentes" }) as const)[
      v ?? "RARELY"
    ],
  music: (v?: string) =>
    (
      ({
        HEADPHONES: "Música con auris",
        SPEAKER_DAY: "Música de día",
        SPEAKER_NIGHT: "Música de noche",
      }) as const
    )[v ?? "SPEAKER_DAY"],
  cigs: (v?: string) =>
    (({ NEVER: "No fuma", SOCIALLY: "Fuma social", REGULAR: "Fuma" }) as const)[v ?? "NEVER"],
  weed: (v?: string) =>
    (({ NEVER: "Weed: nunca", SOCIALLY: "Weed social", REGULAR: "Weed regular" }) as const)[
      v ?? "NEVER"
    ],
  alcohol: (v?: string) =>
    (
      ({ NEVER: "Alcohol: nunca", SOCIALLY: "Alcohol social", REGULAR: "Alcohol regular" }) as const
    )[v ?? "NEVER"],
  petsOk: (v?: string) =>
    (({ DOGS_OK: "Perros ok", CATS_OK: "Gatos ok", NONE: "Sin mascotas" }) as const)[v ?? "NONE"],
  cooking: (v?: string) =>
    (({ NEVER: "Cocina poco", SOMETIMES: "Cocina a veces", OFTEN: "Cocina seguido" }) as const)[
      v ?? "SOMETIMES"
    ],
  diet: (v?: string) =>
    (({ OMNIVORE: "Omnívora", VEGETARIAN: "Vegetariana", VEGAN: "Vegana" }) as const)[
      v ?? "OMNIVORE"
    ],
  share: (v?: string) =>
    (
      ({
        RELAXED: "Compartir: flexible",
        NORMAL: "Compartir: normal",
        STRICT: "Compartir: estricto",
      }) as const
    )[v ?? "NORMAL"],
};

export function UserInfoCard({ profile, location, filters, budgetFull }: UserInfoCardProps) {
  const { height: winH } = useWindowDimensions();

  return (
    <View className="px-4 pt-6 pb-28 bg-white" style={{ minHeight: winH }}>
      <View className="rounded-xl p-4 bg-blue-50 border border-blue-100 mb-6">
        <Text className="text-[12px] font-semibold text-blue-700 uppercase tracking-wide mb-1">
          Sobre mí
        </Text>
        <Text className="text-[14px] text-slate-800">{profile.bio}</Text>
      </View>

      <View className="gap-3">
        <Row
          title="Ubicación actual"
          value={`${location.neighborhood.name}, ${location.city.name}`}
        />
        <Row
          title="Preferencia principal"
          value={`${filters.mainPreferredLocation.department.name} · ${filters.mainPreferredLocation.city.name} · ${filters.mainPreferredLocation.neighborhood.name}`}
        />
        {filters.preferredLocations.map((loc, i) => (
          <Row
            key={String(i)}
            title={i === 0 ? "Otras preferencias" : ""}
            value={`${loc.department.name} · ${loc.city.name} · ${loc.neighborhood.name}`}
          />
        ))}
        <Row title="Presupuesto" value={budgetFull} />
        <Row
          title="Rutina"
          value={`${t.schedule(profile.schedule) ?? "—"} · ${profile.quietHoursStart ?? 22}–${profile.quietHoursEnd ?? 7}h tranquila`}
        />
        <Row
          title="Convivencia"
          value={`${t.tidiness(profile.tidiness) ?? "—"} · ${t.guests(profile.guestsFreq) ?? "—"} · ${t.share(profile.sharePolicy) ?? "—"}`}
        />
        <Row title="Sonido" value={t.music(profile.musicUsage) ?? "—"} />
        <Row
          title="Mascotas"
          value={`${
            profile.petsOwned && profile.petsOwned.length ? "Tiene perro" : "Sin mascotas"
          } · ${t.petsOk(profile.petsOk) ?? "—"}`}
        />
        <Row
          title="Fumar"
          value={`${t.cigs(profile.smokesCigarettes) ?? "—"} · ${t.weed(profile.smokesWeed) ?? "—"}`}
        />
        <Row title="Alcohol" value={t.alcohol(profile.alcohol) ?? "—"} />
        <Row
          title="Cocina y dieta"
          value={`${t.cooking(profile.cooking) ?? "—"} · ${t.diet(profile.diet) ?? "—"}`}
        />
        <Row title="Idiomas" value={(profile.languages && profile.languages.join(", ")) || "—"} />
        <Row title="Intereses" value={(profile.interests && profile.interests.join(", ")) || "—"} />
        <Row title="Educación" value={profile.education ?? "—"} />
        <Row title="Ocupación" value={profile.occupation ?? "—"} />
      </View>
    </View>
  );
}
