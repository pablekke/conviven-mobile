export interface UserProfileData {
  bio?: string;
  smokingStatus: string; // Cigarrillos: no, yes, socially
  marijuanaStatus?: string; // Marihuana: no, yes, socially
  alcoholStatus?: string; // Alcohol: no, socially, regularly
  hasPets: string; // Mascotas que tiene: dog, cat, other, none
  acceptsPets?: string; // Acepta mascotas: cats_dogs_ok, no_pets, depends
  tidinessLevel: string; // Orden: very_tidy, average, messy
  socialLife: string; // Visitas: often, sometimes, rarely
  workSchedule: string; // Horario trabajo: morning, afternoon, evening, mixed
  sleepTime: string; // Rutina sueño: early_bird, night_owl, flexible
}

export interface UseUserProfileDataReturn {
  profileData: UserProfileData;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  updateProfileData: (field: keyof UserProfileData, value: string) => void;
  saveProfileData: () => Promise<void>;
  resetToUserData: () => void;
}
