import {
  SmokesCigarettes,
  SmokesWeed,
  Alcohol,
  PetType,
  PetsOk,
  Tidiness,
  GuestsFreq,
  Schedule,
  Cooking,
  Diet,
  SharePolicy,
  Interest,
  ZodiacSign,
} from "../enums/searchPreferences.enums";

export interface UserProfileData {
  bio?: string;
  smokingStatus?: SmokesCigarettes | string;
  marijuanaStatus?: SmokesWeed | string;
  alcoholStatus?: Alcohol | string;
  hasPets?: PetType | string;
  petsOwned?: (PetType | string)[];
  acceptsPets?: PetsOk | string;
  tidinessLevel?: Tidiness | string;
  socialLife?: GuestsFreq | string;
  sleepTime?: Schedule | string;
  cooking?: Cooking | string;
  diet?: Diet | string;
  sharePolicy?: SharePolicy | string;
  interests?: (Interest | string)[];
  zodiacSign?: ZodiacSign | string;
  [key: string]: string | string[] | undefined | any; // Any to allow Enums
}

export interface UseUserProfileDataReturn {
  profileData: UserProfileData;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  updateProfileData: (field: keyof UserProfileData, value: string | string[]) => void;
  saveProfileData: () => Promise<void>;
  resetToUserData: () => void;
}
