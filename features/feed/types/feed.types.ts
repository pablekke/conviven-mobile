import { GenderPreference, CleaningFrequency, MatchActionType } from "../../../core/enums";

export interface Roomie {
  id: string;
  name: string;
  age: number;
  profession: string;
  bio: string;
  interests: string[];
  matchScore: number;
  photo: string;
  location?: string;
  university?: string;
  department?: string;
  neighborhood?: string;
  budget?: {
    min: number | null;
    max: number | null;
  };
  moveInDate?: string;
  lastActiveDays?: number;
  lifestyle: {
    smoking: boolean;
    pets: boolean;
    guests: boolean;
    cleaning: CleaningFrequency;
  };
  preferences: {
    gender: GenderPreference;
    ageRange: {
      min: number;
      max: number;
    };
    lifestyle: string[];
  };
}

export interface MatchAction {
  type: MatchActionType;
  roomieId: string;
  timestamp: Date;
}

export interface FeedState {
  currentIndex: number;
  roomies: Roomie[];
  isLoading: boolean;
  hasMore: boolean;
  error?: string;
}

export interface MatchingFeedResponse {
  items: Roomie[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
