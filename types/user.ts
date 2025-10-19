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

export interface VerificationStatus {
  email: boolean;
  identity: boolean;
  phone: boolean;
  references: number;
  reliabilityLevel?: string;
}

export interface RoommatePreferences {
  cleanlinessLevel?: string;
  schedules?: string;
  guestsPolicy?: string;
  petsPolicy?: string;
  sharedSpaces?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  currency?: string;
  tidiness?: string;
  schedule?: string;
  guestsFreq?: string;
  musicUsage?: string;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  smokesCigarettes?: string;
  smokesWeed?: string;
  alcohol?: string;
  petsOwned?: string[];
  petsOk?: string;
  cooking?: string;
  diet?: string;
  sharePolicy?: string;
  languages?: string[];
  interests?: string[];
  zodiacSign?: string;
  hasPhoto?: boolean;
  notificationsEnabled?: boolean;
  notificationToken?: string | null;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchPreferences {
  id: string;
  userId: string;
  noCigarettes?: boolean;
  noWeed?: boolean;
  noPets?: boolean;
  petsRequired?: boolean;
  requireQuietHoursOverlap?: boolean;
  tidinessMin?: string;
  schedulePref?: string;
  guestsMax?: string;
  musicMax?: string;
  languagesPref?: string[];
  interestsPref?: string[];
  zodiacPref?: string[];
  lastActiveWithinDays?: number;
  createdAt: string;
  updatedAt: string;
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
  city?: City;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  departmentId?: string;
  departmentName?: string;
  cityId?: string;
  cityName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  role?: UserRole;
  status?: UserStatus;
  searchPreferencesId?: string;
  reliabilityScore?: number;
  verificationStatus?: VerificationStatus;
  searchStatus?: string;
  lastLoginAt?: string;
  roommatePreferences?: RoommatePreferences;
  hobby?: string;
  profession?: string;
  jobTitle?: string;
  petFriendly?: boolean;
  profile?: UserProfile;
  searchPreferences?: UserSearchPreferences;
}

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

export interface PublicRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface AdminRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
}

export interface UpdateUserPayload {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  searchPreferencesId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  departmentId?: string;
  neighborhoodId?: string;
  gender?: Gender;
  birthDate?: string;
  location?: string;
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
