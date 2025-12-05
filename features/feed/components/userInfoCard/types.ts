export interface Profile {
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
  zodiacSign?: string;
}

export interface Location {
  neighborhood: { name: string };
  city: { name: string };
  department: { name: string };
}

export interface Filters {
  mainPreferredLocation: Location;
  preferredLocations: readonly Location[];
}

export interface UserInfoCardProps {
  profile: Profile;
  location: Location;
  filters: Filters;
  budgetFull: string;
  style?: import("react-native").ViewStyle;
}
