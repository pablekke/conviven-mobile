import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Pill, LocationChip, PhotoCarousel, UserInfoCard, ActionDock } from "./index";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";

// -------------------- helpers --------------------
function calcAge(dobISO: string, asOf = new Date()) {
  const dob = new Date(dobISO);
  let a = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) a--;
  return a;
}
function toInt(u: unknown) {
  if (u == null) return "—";
  const n = typeof u === "string" ? parseFloat(u) : (u as number);
  if (Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

// -------------------- mock data --------------------
const incoming = {
  firstName: "Lucía",
  lastName: "Rodríguez",
  displayName: "Lucía Rodríguez",
  birthDate: "1982-11-26T00:00:00.000Z",
  gender: "NON_BINARY",
  location: {
    neighborhood: { id: "8bc0ea28-e86f-451e-8349-b455fae9c0fb", name: "Aires Puros" },
    city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
    department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
  },
  profile: {
    bio: "Hola, soy Lucía me gusta pescar y la merca",
    occupation: "Abogada",
    education: "Licenciada en abogacía",
    tidiness: "NEAT",
    schedule: "MIXED",
    guestsFreq: "RARELY",
    musicUsage: "SPEAKER_DAY",
    quietHoursStart: 19,
    quietHoursEnd: 4,
    smokesCigarettes: "SOCIALLY",
    smokesWeed: "REGULAR",
    alcohol: "REGULAR",
    petsOwned: ["Dog"],
    petsOk: "DOGS_OK",
    cooking: "OFTEN",
    diet: "VEGAN",
    sharePolicy: "STRICT",
    languages: ["es"],
    interests: ["música", "deportes"],
    zodiacSign: "SAGITTARIUS",
    hasPhoto: true,
    lastActiveAt: "2025-09-13T22:53:19.982Z",
  },
  filters: {
    budgetMin: "10000.00",
    budgetMax: "50000.00",
    mainPreferredLocation: {
      neighborhood: { id: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14", name: "Centro" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    preferredLocations: [
      {
        neighborhood: { id: "a38bcd6e-8fc1-4d56-964a-9691936b7406", name: "Barrio Sur" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      {
        neighborhood: { id: "66fbbe15-5449-4234-be76-4e1664b54cec", name: "Aguada" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
    ],
    photoUrl: "PONELE UNA URL DE EJEMPLO",
    secondaryPhotoUrls: ["PONELE UNA URL DE EJEMPLO", "PONELE UNA URL DE EJEMPLO"],
  },
  photoUrl:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
  secondaryPhotoUrls: [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1480&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1480&auto=format&fit=crop",
  ],
} as const;

// -------------------- Pantalla --------------------
function FeedScreen() {
  const TAB_BAR_HEIGHT = 32; // altura reservada para una tab bar del host app

  const { height: winH } = useWindowDimensions();
  const HERO_HEIGHT = Math.max(0, winH - TAB_BAR_HEIGHT);

  const age = useMemo(() => calcAge(incoming.birthDate), []);
  const [locOpen, setLocOpen] = useState(false);
  const [locW, setLocW] = useState<number | undefined>(undefined);
  const mainRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();

  const basicInfo = useMemo(
    () => [
      incoming.profile.tidiness === "NEAT" ? "Ordenada" : "Normal",
      incoming.profile.schedule === "MIXED" ? "Horarios mixtos" : "Diurna",
      incoming.profile.diet === "VEGAN" ? "Vegana" : "Omnívora",
    ],
    [],
  );

  const photos = useMemo(() => {
    const primary =
      incoming.photoUrl && String(incoming.photoUrl).includes("PONELE")
        ? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop"
        : incoming.photoUrl;
    const secondaryArr = Array.isArray(incoming.secondaryPhotoUrls)
      ? incoming.secondaryPhotoUrls
      : [];
    const secondary = secondaryArr.map(p =>
      String(p).includes("PONELE")
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1480&auto=format&fit=crop"
        : p,
    );
    return [primary, ...secondary];
  }, []);

  const locStrings = useMemo(() => {
    const main = `${incoming.filters.mainPreferredLocation.department.name} · ${incoming.filters.mainPreferredLocation.city.name} · ${incoming.filters.mainPreferredLocation.neighborhood.name}`;
    const others = incoming.filters.preferredLocations.map(
      loc => `${loc.city.name} · ${loc.neighborhood.name}`,
    );
    return [main, ...others];
  }, []);

  const longestLoc = useMemo(
    () => locStrings.reduce((a, b) => (b.length > a.length ? b : a), locStrings[0] || ""),
    [locStrings],
  );

  const budgetMinStr = toInt(incoming.filters?.budgetMin);
  const budgetMaxStr = toInt(incoming.filters?.budgetMax);
  const budgetFull = `$${budgetMinStr}–$${budgetMaxStr}`;

  function scrollToNext() {
    if (!mainRef.current) return;
    mainRef.current.scrollTo({ y: HERO_HEIGHT, animated: true });
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Medidor oculto del ancho del chip de ubicación */}
      <View
        className="absolute -left-[9999px] top-0 flex-row items-center gap-2 px-3 py-1"
        onLayout={e => {
          const measuredWidth = e.nativeEvent.layout.width;
          const maxWidth = screenWidth * 0.7;
          setLocW(Math.min(measuredWidth, maxWidth));
        }}
      >
        <Text className="text-[13px] font-semibold flex-1">{longestLoc}</Text>
        <View style={styles.iconSpacer} />
      </View>

      <ScrollView ref={mainRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View className="relative w-full" style={{ height: HERO_HEIGHT }}>
          <View className="w-full h-full relative overflow-hidden">
            <PhotoCarousel photos={photos} height={HERO_HEIGHT} />

            <LocationChip
              locations={locStrings}
              width={locW}
              isOpen={locOpen}
              onToggle={() => setLocOpen(v => !v)}
            />

            {/* Gradiente inferior + texto */}
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradientOverlay}
              pointerEvents="none"
            />

            {/* Nombre / presupuesto / chips */}
            <View className="absolute left-4 right-4 bottom-3 z-20">
              <View className="flex-row items-center justify-between px-1">
                <Text numberOfLines={1} className="text-white text-[18px] font-extrabold">
                  {incoming.displayName ?? `${incoming.firstName} ${incoming.lastName}`}, {age}
                </Text>
                <Text numberOfLines={1} className="text-white text-[13px] font-semibold">
                  {budgetFull}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                <View className="flex-row">
                  {basicInfo.map(info => (
                    <Pill key={info}>{info}</Pill>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Indicador “Deslizar” */}
            <Pressable
              accessibilityLabel="Deslizar hacia abajo"
              onPress={scrollToNext}
              className="absolute left-0 right-0 bottom-24 z-30 items-center"
            >
              <Feather name="chevron-down" size={28} color="#ffffff" />
              <Text className="text-white text-[10px] font-semibold uppercase opacity-90 mt-1">
                Deslizar
              </Text>
            </Pressable>

            <ActionDock />
          </View>
        </View>

        <UserInfoCard
          profile={incoming.profile}
          location={incoming.location}
          filters={incoming.filters}
          budgetFull={budgetFull}
        />
      </ScrollView>

      {/* Reservamos espacio visual para una tab bar del host app, pero NO renderizamos menú */}
      <View style={{ height: TAB_BAR_HEIGHT }} />
    </View>
  );
}

export default FeedScreen;

const styles = StyleSheet.create({
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  iconSpacer: {
    width: 14,
    height: 14,
  },
});
