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
  gender?: string;
  departmentId?: string;
  departmentName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
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
  gender: string;
  departmentId: string;
  neighborhoodId: string;
}
