import {
  Alcohol,
  Cooking,
  Diet,
  Gender,
  GuestsFreq,
  MusicUsage,
  PetsOk,
  Schedule,
  SharePolicy,
  SmokesCigarettes,
  SmokesWeed,
  Tidiness,
  ZodiacSign,
} from "../../../core/enums/profile.enums";
import type {
  BackendLocationEntity,
  BackendUser,
  BackendUserFilters,
  BackendUserProfile,
} from "../adapters/feedAdapter";
import type { ProfileLike } from "../utils/profileCardData";

type CompleteLocation = {
  neighborhood: BackendLocationEntity;
  city: BackendLocationEntity;
  department: BackendLocationEntity;
};

type MockedBackendUser = BackendUser & {
  profile: BackendUserProfile;
  filters: BackendUserFilters & {
    mainPreferredLocation: CompleteLocation;
    preferredLocations: CompleteLocation[];
  };
  location: CompleteLocation;
  birthDate: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoUrl: string;
  secondaryPhotoUrls: string[];
};

export const incomingProfilesMock: MockedBackendUser[] = [
  {
    birthDate: "2001-11-26T00:00:00.000Z",
    firstName: "Lucía",
    lastName: "Rodríguez",
    displayName: "Lucía Rodríguez",
    gender: Gender.NON_BINARY,
    profile: {
      id: "profile-lucia-rodriguez",
      userId: "user-lucia-rodriguez",
      bio: "Hola, soy Lucía me gusta la naturaleza y el deporte. Soy tranquila y suelo trabajar desde casa por la mañana.",
      currency: "UYU",
      occupation: "Abogada",
      education: "Licenciada en abogacía",
      tidiness: Tidiness.NEAT,
      schedule: Schedule.MIXED,
      guestsFreq: GuestsFreq.RARELY,
      musicUsage: MusicUsage.SPEAKER_DAY,
      quietHoursStart: 19,
      quietHoursEnd: 4,
      smokesCigarettes: SmokesCigarettes.SOCIALLY,
      smokesWeed: SmokesWeed.REGULAR,
      alcohol: Alcohol.REGULAR,
      petsOwned: ["Dog"],
      petsOk: PetsOk.DOGS_OK,
      cooking: Cooking.OFTEN,
      diet: Diet.VEGAN,
      sharePolicy: SharePolicy.STRICT,
      languages: ["es"],
      interests: ["música", "deportes"],
      zodiacSign: ZodiacSign.SAGITTARIUS,
      hasPhoto: true,
      notificationsEnabled: null,
      notificationToken: null,
      lastActiveAt: "2025-09-13T22:53:19.982Z",
      createdAt: "2024-08-01T00:00:00.000Z",
      updatedAt: "2025-09-13T22:53:19.982Z",
    },
    filters: {
      userId: "user-lucia-rodriguez",
      mainPreferredNeighborhoodId: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
      genderPref: null,
      minAge: 24,
      maxAge: 33,
      budgetMin: "10000.00",
      budgetMax: "50000.00",
      onlyWithPhoto: true,
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
    },
    preferences: null,
    desirabilityRating: 0.86,
    preferredNeighborhoodIds: [
      "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
      "a38bcd6e-8fc1-4d56-964a-9691936b7406",
      "66fbbe15-5449-4234-be76-4e1664b54cec",
    ],
    photosCount: 1,
    profileCompletionRate: 0.92,
    lastActiveDays: 4,
    photoUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [],
    location: {
      neighborhood: { id: "8bc0ea28-e86f-451e-8349-b455fae9c0fb", name: "Aires Puros" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-09-14T10:30:00.000Z",
  },
  {
    birthDate: "1996-04-12T00:00:00.000Z",
    firstName: "Martin",
    lastName: "Gómez",
    displayName: "Martin Gómez",
    gender: Gender.MALE,
    profile: {
      id: "profile-martin-gomez",
      userId: "user-martin-gomez",
      bio: "Diseñador UX, fan de la fotografía y el yoga. Busco un espacio tranquilo pero social.",
      currency: "UYU",
      occupation: "Diseñador UX",
      education: "Licenciatura en Diseño",
      tidiness: Tidiness.NEAT,
      schedule: Schedule.EARLY_BIRD,
      guestsFreq: GuestsFreq.SOMETIMES,
      musicUsage: MusicUsage.SPEAKER_FLEX,
      quietHoursStart: 21,
      quietHoursEnd: 6,
      smokesCigarettes: SmokesCigarettes.NO,
      smokesWeed: SmokesWeed.SOCIALLY,
      alcohol: Alcohol.SOCIALLY,
      petsOwned: ["Cat"],
      petsOk: PetsOk.CATS_OK,
      cooking: Cooking.SOMETIMES,
      diet: Diet.VEGETARIAN,
      sharePolicy: SharePolicy.ASK_FIRST,
      languages: ["es", "en"],
      interests: ["diseño", "fotografía", "yoga"],
      zodiacSign: ZodiacSign.ARIES,
      hasPhoto: true,
      notificationsEnabled: true,
      notificationToken: null,
      lastActiveAt: "2025-10-02T15:20:11.982Z",
      createdAt: "2024-06-15T12:05:00.000Z",
      updatedAt: "2025-10-02T15:20:11.982Z",
    },
    filters: {
      userId: "user-martin-gomez",
      mainPreferredNeighborhoodId: "311a1a24-e064-4b0d-8dd4-67e3d32a9d98",
      genderPref: null,
      minAge: 25,
      maxAge: 35,
      budgetMin: "18000.00",
      budgetMax: "30000.00",
      onlyWithPhoto: true,
      mainPreferredLocation: {
        neighborhood: { id: "311a1a24-e064-4b0d-8dd4-67e3d32a9d98", name: "Parque Rodó" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      preferredLocations: [
        {
          neighborhood: { id: "f123ed12-32a4-4ef2-8255-87f91f9f6f0a", name: "Pocitos" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
      ],
    },
    preferences: null,
    desirabilityRating: 0.82,
    preferredNeighborhoodIds: [
      "311a1a24-e064-4b0d-8dd4-67e3d32a9d98",
      "f123ed12-32a4-4ef2-8255-87f91f9f6f0a",
    ],
    photosCount: 2,
    profileCompletionRate: 0.88,
    lastActiveDays: 6,
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
    ],
    location: {
      neighborhood: { id: "bd234b92-40ee-4c35-8a6f-20e6fa807f1a", name: "Cordón" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-10-03T09:15:00.000Z",
  },
  {
    birthDate: "1998-02-17T00:00:00.000Z",
    firstName: "Camila",
    lastName: "Pérez",
    displayName: "Camila Pérez",
    gender: Gender.FEMALE,
    profile: {
      id: "profile-camila-perez",
      userId: "user-camila-perez",
      bio: "Ingeniera química, fan del mate y las caminatas. Trabajo híbrido y busco compañeras ordenadas.",
      currency: "UYU",
      occupation: "Ingeniera química",
      education: "Maestría en Ingeniería",
      tidiness: Tidiness.NEAT,
      schedule: Schedule.EARLY_BIRD,
      guestsFreq: GuestsFreq.RARELY,
      musicUsage: MusicUsage.HEADPHONES,
      quietHoursStart: 22,
      quietHoursEnd: 6,
      smokesCigarettes: SmokesCigarettes.NO,
      smokesWeed: SmokesWeed.NO,
      alcohol: Alcohol.SOCIALLY,
      petsOwned: [],
      petsOk: PetsOk.CATS_OK,
      cooking: Cooking.OFTEN,
      diet: Diet.VEGETARIAN,
      sharePolicy: SharePolicy.ASK_FIRST,
      languages: ["es", "en", "pt"],
      interests: ["ciencia", "senderismo", "cocina"],
      zodiacSign: ZodiacSign.AQUARIUS,
      hasPhoto: true,
      notificationsEnabled: true,
      notificationToken: null,
      lastActiveAt: "2025-10-22T14:05:41.982Z",
      createdAt: "2024-09-09T09:30:00.000Z",
      updatedAt: "2025-10-22T14:05:41.982Z",
    },
    filters: {
      userId: "user-camila-perez",
      mainPreferredNeighborhoodId: "66fbbe15-5449-4234-be76-4e1664b54cec",
      genderPref: null,
      minAge: 24,
      maxAge: 32,
      budgetMin: "22000.00",
      budgetMax: "36000.00",
      onlyWithPhoto: true,
      mainPreferredLocation: {
        neighborhood: { id: "66fbbe15-5449-4234-be76-4e1664b54cec", name: "Aguada" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      preferredLocations: [
        {
          neighborhood: { id: "311a1a24-e064-4b0d-8dd4-67e3d32a9d98", name: "Parque Rodó" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
      ],
    },
    preferences: null,
    desirabilityRating: 0.9,
    preferredNeighborhoodIds: [
      "66fbbe15-5449-4234-be76-4e1664b54cec",
      "311a1a24-e064-4b0d-8dd4-67e3d32a9d98",
    ],
    photosCount: 3,
    profileCompletionRate: 0.95,
    lastActiveDays: 1,
    photoUrl:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1480&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
    ],
    location: {
      neighborhood: { id: "7c0afc9b-1b3a-4c91-9b56-7b1a62c1e6a5", name: "Parque Batlle" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-10-22T15:00:00.000Z",
  },
  {
    birthDate: "1994-07-30T00:00:00.000Z",
    firstName: "Diego",
    lastName: "Fernández",
    displayName: "Diego Fernández",
    gender: Gender.MALE,
    profile: {
      id: "profile-diego-fernandez",
      userId: "user-diego-fernandez",
      bio: "Product manager remoto. Me gusta la cocina, el cine y compartir cenas con roommates.",
      currency: "UYU",
      occupation: "Product Manager",
      education: "Licenciatura en Administración",
      tidiness: Tidiness.AVERAGE,
      schedule: Schedule.MIXED,
      guestsFreq: GuestsFreq.SOMETIMES,
      musicUsage: MusicUsage.SPEAKER_FLEX,
      quietHoursStart: 23,
      quietHoursEnd: 7,
      smokesCigarettes: SmokesCigarettes.SOCIALLY,
      smokesWeed: SmokesWeed.SOCIALLY,
      alcohol: Alcohol.SOCIALLY,
      petsOwned: ["Cat"],
      petsOk: PetsOk.CATS_DOGS_OK,
      cooking: Cooking.SOMETIMES,
      diet: Diet.NONE,
      sharePolicy: SharePolicy.BASIC_SHARED,
      languages: ["es", "en"],
      interests: ["cine", "gastronomía", "tecnología"],
      zodiacSign: ZodiacSign.LEO,
      hasPhoto: true,
      notificationsEnabled: false,
      notificationToken: null,
      lastActiveAt: "2025-11-01T20:18:09.000Z",
      createdAt: "2024-05-22T18:45:00.000Z",
      updatedAt: "2025-11-01T20:18:09.000Z",
    },
    filters: {
      userId: "user-diego-fernandez",
      mainPreferredNeighborhoodId: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
      genderPref: null,
      minAge: 26,
      maxAge: 38,
      budgetMin: "26000.00",
      budgetMax: "42000.00",
      onlyWithPhoto: true,
      mainPreferredLocation: {
        neighborhood: { id: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14", name: "Centro" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      preferredLocations: [
        {
          neighborhood: { id: "bd234b92-40ee-4c35-8a6f-20e6fa807f1a", name: "Cordón" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
        {
          neighborhood: { id: "f123ed12-32a4-4ef2-8255-87f91f9f6f0a", name: "Pocitos" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
      ],
    },
    preferences: null,
    desirabilityRating: 0.78,
    preferredNeighborhoodIds: [
      "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
      "bd234b92-40ee-4c35-8a6f-20e6fa807f1a",
      "f123ed12-32a4-4ef2-8255-87f91f9f6f0a",
    ],
    photosCount: 2,
    profileCompletionRate: 0.84,
    lastActiveDays: 0,
    photoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
    ],
    location: {
      neighborhood: { id: "a9ff215b-95de-4fe9-b1ad-72dfa7c9e483", name: "Ciudad Vieja" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-11-02T08:40:00.000Z",
  },
  {
    birthDate: "2000-11-05T00:00:00.000Z",
    firstName: "Valentina",
    lastName: "Silva",
    displayName: "Valentina Silva",
    gender: Gender.FEMALE,
    profile: {
      id: "profile-valentina-silva",
      userId: "user-valentina-silva",
      bio: "Estudiante de arquitectura, amante de la ilustración y la playa. Busco ambiente creativo y respetuoso.",
      currency: "UYU",
      occupation: "Estudiante de Arquitectura",
      education: "Licenciatura en curso",
      tidiness: Tidiness.CHILL,
      schedule: Schedule.NIGHT_OWL,
      guestsFreq: GuestsFreq.WEEKLY_PLUS,
      musicUsage: MusicUsage.SPEAKER_DAY,
      quietHoursStart: 0,
      quietHoursEnd: 8,
      smokesCigarettes: SmokesCigarettes.NO,
      smokesWeed: SmokesWeed.REGULAR,
      alcohol: Alcohol.REGULAR,
      petsOwned: [],
      petsOk: PetsOk.CATS_DOGS_OK,
      cooking: Cooking.RARE,
      diet: Diet.OTHER,
      sharePolicy: SharePolicy.ASK_FIRST,
      languages: ["es", "en", "it"],
      interests: ["arte", "dibujo", "surf"],
      zodiacSign: ZodiacSign.SCORPIO,
      hasPhoto: true,
      notificationsEnabled: true,
      notificationToken: null,
      lastActiveAt: "2025-09-28T02:12:55.000Z",
      createdAt: "2024-07-24T14:20:00.000Z",
      updatedAt: "2025-09-28T02:12:55.000Z",
    },
    filters: {
      userId: "user-valentina-silva",
      mainPreferredNeighborhoodId: "f123ed12-32a4-4ef2-8255-87f91f9f6f0a",
      genderPref: null,
      minAge: 22,
      maxAge: 32,
      budgetMin: "15000.00",
      budgetMax: "28000.00",
      onlyWithPhoto: true,
      mainPreferredLocation: {
        neighborhood: { id: "f123ed12-32a4-4ef2-8255-87f91f9f6f0a", name: "Pocitos" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      preferredLocations: [
        {
          neighborhood: { id: "b44b5bff-d288-4d7c-a2f2-5b2ce49963cf", name: "Buceo" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
      ],
    },
    preferences: null,
    desirabilityRating: 0.81,
    preferredNeighborhoodIds: [
      "f123ed12-32a4-4ef2-8255-87f91f9f6f0a",
      "b44b5bff-d288-4d7c-a2f2-5b2ce49963cf",
    ],
    photosCount: 3,
    profileCompletionRate: 0.9,
    lastActiveDays: 14,
    photoUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1480&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1480&auto=format&fit=crop",
    ],
    location: {
      neighborhood: { id: "927b8f2f-33de-4779-ba47-99d79f2f35b5", name: "Malvín" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-09-29T11:00:00.000Z",
  },
  {
    birthDate: "1992-05-11T00:00:00.000Z",
    firstName: "Agustín",
    lastName: "Cabrera",
    displayName: "Agustín Cabrera",
    gender: Gender.MALE,
    profile: {
      id: "profile-agustin-cabrera",
      userId: "user-agustin-cabrera",
      bio: "Profesor de historia y músico aficionado. Me gusta compartir charlas y mantener la casa ordenada.",
      currency: "UYU",
      occupation: "Profesor de Historia",
      education: "Profesorado completo",
      tidiness: Tidiness.NEAT,
      schedule: Schedule.MIXED,
      guestsFreq: GuestsFreq.RARELY,
      musicUsage: MusicUsage.HEADPHONES,
      quietHoursStart: 21,
      quietHoursEnd: 6,
      smokesCigarettes: SmokesCigarettes.NO,
      smokesWeed: SmokesWeed.NO,
      alcohol: Alcohol.SOCIALLY,
      petsOwned: ["Dog"],
      petsOk: PetsOk.DOGS_OK,
      cooking: Cooking.OFTEN,
      diet: Diet.NONE,
      sharePolicy: SharePolicy.BASIC_SHARED,
      languages: ["es", "en", "fr"],
      interests: ["historia", "música", "ciclismo"],
      zodiacSign: ZodiacSign.TAURUS,
      hasPhoto: true,
      notificationsEnabled: true,
      notificationToken: null,
      lastActiveAt: "2025-10-18T09:47:32.000Z",
      createdAt: "2024-03-18T17:10:00.000Z",
      updatedAt: "2025-10-18T09:47:32.000Z",
    },
    filters: {
      userId: "user-agustin-cabrera",
      mainPreferredNeighborhoodId: "7c0afc9b-1b3a-4c91-9b56-7b1a62c1e6a5",
      genderPref: null,
      minAge: 27,
      maxAge: 40,
      budgetMin: "20000.00",
      budgetMax: "35000.00",
      onlyWithPhoto: true,
      mainPreferredLocation: {
        neighborhood: { id: "7c0afc9b-1b3a-4c91-9b56-7b1a62c1e6a5", name: "Parque Batlle" },
        city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
        department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
      },
      preferredLocations: [
        {
          neighborhood: { id: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14", name: "Centro" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
        {
          neighborhood: { id: "a38bcd6e-8fc1-4d56-964a-9691936b7406", name: "Barrio Sur" },
          city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
          department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
        },
      ],
    },
    preferences: null,
    desirabilityRating: 0.8,
    preferredNeighborhoodIds: [
      "7c0afc9b-1b3a-4c91-9b56-7b1a62c1e6a5",
      "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
      "a38bcd6e-8fc1-4d56-964a-9691936b7406",
    ],
    photosCount: 3,
    profileCompletionRate: 0.89,
    lastActiveDays: 3,
    photoUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1480&auto=format&fit=crop",
    secondaryPhotoUrls: [
      "https://images.unsplash.com/photo-1512070679279-8988d32161be?q=80&w=1480&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1480&auto=format&fit=crop",
    ],
    location: {
      neighborhood: { id: "bdaa7fb3-5538-4b4a-821b-9c7e3f9dbf2d", name: "La Blanqueada" },
      city: { id: "59edd5cf-8151-4a37-8b84-cc03929e26ba", name: "Montevideo" },
      department: { id: "a2f0e079-c922-44f2-8712-e2710fad74e3", name: "Montevideo" },
    },
    lastLoginAt: "2025-10-19T07:55:00.000Z",
  },
];

const toCompleteLocation = (location: CompleteLocation) => ({
  neighborhood: { name: location.neighborhood.name },
  city: { name: location.city.name },
  department: { name: location.department.name },
});

export const mapBackendFiltersToUi = (
  filters: MockedBackendUser["filters"],
): {
  mainPreferredLocation: ReturnType<typeof toCompleteLocation>;
  preferredLocations: ReturnType<typeof toCompleteLocation>[];
  budgetMin: MockedBackendUser["filters"]["budgetMin"];
  budgetMax: MockedBackendUser["filters"]["budgetMax"];
} => ({
  budgetMin: filters.budgetMin,
  budgetMax: filters.budgetMax,
  mainPreferredLocation: toCompleteLocation(filters.mainPreferredLocation),
  preferredLocations: filters.preferredLocations.map(toCompleteLocation),
});

export const mapBackendProfileToUiProfile = (
  profile: MockedBackendUser["profile"],
): {
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
} => ({
  bio: profile.bio ?? "",
  occupation: profile.occupation ?? undefined,
  education: profile.education ?? undefined,
  tidiness: profile.tidiness ?? undefined,
  schedule: profile.schedule ?? undefined,
  guestsFreq: profile.guestsFreq ?? undefined,
  musicUsage: profile.musicUsage ?? undefined,
  quietHoursStart: profile.quietHoursStart ?? undefined,
  quietHoursEnd: profile.quietHoursEnd ?? undefined,
  petsOwned: profile.petsOwned ?? undefined,
  petsOk: profile.petsOk ?? undefined,
  cooking: profile.cooking ?? undefined,
  diet: profile.diet ?? undefined,
  sharePolicy: profile.sharePolicy ?? undefined,
  languages: profile.languages ?? undefined,
  interests: profile.interests ?? undefined,
  smokesCigarettes: profile.smokesCigarettes ?? undefined,
  smokesWeed: profile.smokesWeed ?? undefined,
  alcohol: profile.alcohol ?? undefined,
});

export const mapBackendLocationToUi = (location: MockedBackendUser["location"]) =>
  toCompleteLocation(location);

export const mapBackendToProfileLike = (profile: MockedBackendUser): ProfileLike => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  displayName: profile.displayName,
  birthDate: profile.birthDate,
  photoUrl: profile.photoUrl,
  secondaryPhotoUrls: profile.secondaryPhotoUrls,
  profile: {
    tidiness: profile.profile.tidiness ?? undefined,
    schedule: profile.profile.schedule ?? undefined,
    diet: profile.profile.diet ?? undefined,
    occupation: profile.profile.occupation ?? undefined,
  },
  filters: {
    budgetMin: profile.filters.budgetMin,
    budgetMax: profile.filters.budgetMax,
    mainPreferredLocation: toCompleteLocation(profile.filters.mainPreferredLocation),
    preferredLocations: profile.filters.preferredLocations.map(toCompleteLocation),
  },
});

export type { MockedBackendUser };
