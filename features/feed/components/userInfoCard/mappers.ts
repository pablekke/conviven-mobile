export const t = {
  tidiness: (v?: string) =>
    (({ CHILL: "Relajado", AVERAGE: "Promedio", NEAT: "Ordenado" }) as const)[v ?? "AVERAGE"] ??
    "—",
  schedule: (v?: string) =>
    (({ EARLY_BIRD: "Madrugador", MIXED: "Mixto", NIGHT_OWL: "Noctámbulo" }) as const)[
      v ?? "MIXED"
    ] ?? "—",
  guests: (v?: string) =>
    (({ RARELY: "Rara vez", SOMETIMES: "A veces", "WEEKLY+": "Semanalmente+" }) as const)[
      v ?? "RARELY"
    ] ?? "—",
  music: (v?: string) =>
    (
      ({
        HEADPHONES: "Solo audífonos",
        SPEAKER_DAY: "Parlantes de día",
        SPEAKER_FLEX: "Parlantes flexible",
      }) as const
    )[v ?? "SPEAKER_DAY"] ?? "—",
  cigs: (v?: string) =>
    (({ NO: "No fuma", SOCIALLY: "Fuma social", REGULAR: "Fuma" }) as const)[v ?? "NO"] ?? "—",
  weed: (v?: string) =>
    (({ NO: "🍃Marihuana: NO", SOCIALLY: "🍃Marihuana social", REGULAR: "🍃Marihuana regular" }) as const)[v ?? "NO"] ??
    "—",
  alcohol: (v?: string) =>
    (({ NO: "🍺Alcohol: NO", SOCIALLY: "🍺Alcohol social", REGULAR: "🍺Alcohol regular" }) as const)[
      v ?? "NO"
    ] ?? "—",
  petsOk: (v?: string) =>
    (
      ({
        NO: "Sin mascotas",
        CATS_OK: "Acepta gatos",
        DOGS_OK: "Acepta perros",
        CATS_DOGS_OK: "Acepta ambos",
      }) as const
    )[v ?? "NO"] ?? "—",
  cooking: (v?: string) =>
    (({ RARE: "Cocina poco", SOMETIMES: "Cocina a veces", OFTEN: "Cocina seguido" }) as const)[
      v ?? "SOMETIMES"
    ] ?? "—",
  diet: (v?: string) =>
    (
      ({
        NONE: "Sin dieta",
        VEGETARIAN: "Vegetariana",
        VEGAN: "Vegana",
        OTHER: "Otra",
      }) as const
    )[v ?? "NONE"] ?? "—",
  share: (v?: string) =>
    (
      ({
        STRICT: "Estricto",
        ASK_FIRST: "Preguntar primero",
        BASIC_SHARED: "Comparte básicos",
      }) as const
    )[v ?? "ASK_FIRST"] ?? "—",
  zodiac: (v?: string) =>
    (
      ({
        ARIES: "Aries",
        TAURUS: "Tauro",
        GEMINI: "Géminis",
        CANCER: "Cáncer",
        LEO: "Leo",
        VIRGO: "Virgo",
        LIBRA: "Libra",
        SCORPIO: "Escorpio",
        SAGITTARIUS: "Sagitario",
        CAPRICORN: "Capricornio",
        AQUARIUS: "Acuario",
        PISCES: "Piscis",
        NONE: "",
      }) as const
    )[v ?? "NONE"] ?? "",
};
