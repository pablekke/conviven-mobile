export interface DiscoverCandidate {
  id: string;
  name: string;
  age?: number;
  profession?: string;
  bio?: string;
  interests?: string[];
  matchScore?: number;
  photoUrl?: string;
  distanceText?: string;
  lastActiveDays?: number;
  profileCompletionPercent?: number;
  photosCount?: number;
}

export interface DiscoverFeed {
  candidates: DiscoverCandidate[];
  nextPage?: number | null;
}

export interface MatchingItem {
  userId: string;
  score: number;
  user?: Partial<{
    profile?: Partial<{
      bio?: string;
      hasPhoto?: boolean;
      interests?: string[];
      languages?: string[];
      zodiacSign?: string;
      tidiness?: string;
      schedule?: string;
      guestsFreq?: string;
      musicUsage?: string;
      smokesCigarettes?: string;
      smokesWeed?: string;
      alcohol?: string;
      petsOwned?: string[];
      petsOk?: string;
      cooking?: string;
      diet?: string;
      sharePolicy?: string;
      quietHoursStart?: number;
      quietHoursEnd?: number;
    }>;
    birthDate?: string;
    gender?: string;
    photosCount?: number;
    profileCompletionRate?: number;
    lastActiveDays?: number;
  }>;
}
