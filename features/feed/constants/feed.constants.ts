export const FEED_CONSTANTS = {
  // Paginación
  ROOMIES_PER_PAGE: 20, // Coincide con el backend
  MAX_ROOMIES_CACHE: 50,
  HERO_BOTTOM_EXTRA: 85,
  HERO_IMAGE_EXTRA: 30,
  TAB_BAR_HEIGHT: 50,
  HERO_BLUR_OVERHANG: 80,
  HERO_BLUR_MAX_HEIGHT: 220,
} as const;

export const computeHeroImageHeight = (heroHeight: number, heroBottomSpacing: number) =>
  Math.max(0, heroHeight - heroBottomSpacing + FEED_CONSTANTS.HERO_IMAGE_EXTRA);

export const MOCK_ROOMIES = [
  {
    id: "1",
    name: "Sofía",
    age: 26,
    profession: "Product Designer",
    bio: "Amante del café, el arte y los espacios luminosos. Busco roomie responsable y chill.",
    interests: ["Yoga", "Plantitas", "Brunch"],
    matchScore: 93,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    name: "Andrés",
    age: 28,
    profession: "Software Engineer",
    bio: "Me encantan las bicis, cocinar pastas y mantener la casa en orden. Fan del home office.",
    interests: ["Cocina", "Cycling", "Series"],
    matchScore: 88,
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    name: "Mariana",
    age: 24,
    profession: "Community Manager",
    bio: "Siempre ando buscando conciertos y plan de fin de semana. Amo los gatos y la decoración minimalista.",
    interests: ["Gatos", "Conciertos", "Minimal"],
    matchScore: 91,
    photo:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
] as const;
