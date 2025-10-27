import { useCallback, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import type { LoginCredentials } from "@/types/user";

import { LOGIN_ERROR_MESSAGES } from "../constants";
import type { LoginSubmitResult } from "../types";

export function useLogin() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (credentials: LoginCredentials): Promise<LoginSubmitResult> => {
      try {
        setError(null);
        await login(credentials);
        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : LOGIN_ERROR_MESSAGES.generic;
        setError(message);
        return { success: false, error: message };
      }
    },
    [login],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleFieldFocus = useCallback((_: keyof LoginCredentials) => {
    clearError();
  }, [clearError]);

  return {
    submit,
    isLoading,
    error,
    clearError,
    handleFieldFocus,
  };
}
