export enum UserRole {
  USER = "USER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  UNSPECIFIED = "UNSPECIFIED",
}

export interface LocationEntity {
  id: string;
  name: string;
}

export interface LocationObject {
  neighborhood: LocationEntity;
  city: LocationEntity;
  department: LocationEntity;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  currency: string;
  occupation: string | null;
  education: string | null;
  tidiness: string;
  schedule: string;
  guestsFreq: string;
  musicUsage: string;
  smokesCigarettes: string;
  smokesWeed: string;
  alcohol: string;
  petsOwned: string[];
  petsOk: string;
  cooking: string;
  diet: string;
  sharePolicy: string;
  languages: string[];
  interests: string[];
  zodiacSign: string;
  hasPhoto: boolean;
  notificationsEnabled: boolean;
  notificationToken: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  noCigarettes: boolean | null;
  noWeed: boolean | null;
  noPets: boolean | null;
  petsRequired: boolean | null;
  tidinessMin: string;
  schedulePref: string;
  guestsMax: string;
  musicMax: string;
  languagesPref: string[];
  interestsPref: string[];
  zodiacPref: string[];
  lastActiveWithinDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  id: string;
  userId: string;
  includeAdjacentNeighborhoods: boolean;
  genderPref: string[];
  minAge: number;
  maxAge: number;
  budgetMin: string;
  budgetMax: string;
  onlyWithPhoto: boolean;
  createdAt: string;
  updatedAt: string;
  mainPreferredLocation: LocationObject;
  preferredLocations: LocationObject[];
}

export interface User {
  id: string;
  email: string;
  historicalEmail: string | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string; // MALE, FEMALE, etc.
  desirabilityRating: number;
  role: string;
  status: string;
  location: LocationObject;
  profile: UserProfile;
  preferences: UserPreferences;
  filters: UserFilters;
  photoUrl: string | null;
  secondaryPhotoUrls: string[];
  lastLoginAt: string | null;
  discardedAt: string | null;
}

// Auth & Helper Interfaces (Kept as they are needed for app flow, though not in user/me body)

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | string;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
  role?: UserRole;
}

export interface Department {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
  cityName?: string;
  departmentId?: string;
  departmentName?: string;
  city?: City;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: "email" | "role" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

// Payloads (compatibilidad)
export type PublicRegisterPayload = RegisterCredentials;
export type AdminRegisterPayload = RegisterCredentials & { role?: UserRole | string };

export type UpdateUserPayload = Partial<{
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | string;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
  role: UserRole | string;
  status: UserStatus | string;
  photoUrl: string | null;
}>;
