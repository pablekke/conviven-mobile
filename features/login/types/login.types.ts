import type { LoginCredentials } from "@/types/user";

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface LoginSubmitResult {
  success: boolean;
  error?: string;
}

export type LoginFormValues = LoginCredentials;
