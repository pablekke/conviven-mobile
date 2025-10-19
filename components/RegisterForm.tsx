import React from "react";
import { RegisterForm } from "../features/register";
import { RegisterCredentials } from "../types/user";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

export default function RegisterFormWrapper({ onSubmit, isLoading = false }: RegisterFormProps) {
  return <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />;
}
