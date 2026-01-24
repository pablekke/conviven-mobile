import { Gender } from "../../../types/user";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: Gender;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
}

export interface RegisterCredentials {
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

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  gender?: string;
  departmentId?: string;
  cityId?: string;
  neighborhoodId?: string;
}

export interface LocationData {
  departments: Department[];
  cities: City[];
  neighborhoods: Neighborhood[];
}

export interface Department {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  departmentId: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
  cityName?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface LocationLoading {
  departments: boolean;
  cities: boolean;
  neighborhoods: boolean;
}
