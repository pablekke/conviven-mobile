import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import { useAuth } from "@/context/AuthContext";
import type { LoginCredentials } from "@/types/user";
import { NetworkError } from "@/services/http";

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
        console.error("[useLogin] Error:", err);

        let message: string;

        // Detectar errores de red
        if (err instanceof NetworkError) {
          message = LOGIN_ERROR_MESSAGES.network;
        }
        // Detectar si el mensaje de error contiene HTML (ngrok, error pages, etc)
        else if (
          err instanceof Error &&
          (err.message.includes("<!DOCTYPE") || err.message.includes("<html"))
        ) {
          message = LOGIN_ERROR_MESSAGES.serverUnavailable;
        }
        // Detectar errores de timeout
        else if (err instanceof Error && err.message.includes("timeout")) {
          message = LOGIN_ERROR_MESSAGES.timeout;
        }
        // Detectar credenciales inválidas
        else if (
          err instanceof Error &&
          (err.message.includes("401") || err.message.includes("Unauthorized"))
        ) {
          message = LOGIN_ERROR_MESSAGES.invalidCredentials;
        }
        // Detectar servidor no disponible
        else if (
          err instanceof Error &&
          (err.message.includes("503") ||
            err.message.includes("502") ||
            err.message.includes("500"))
        ) {
          message = LOGIN_ERROR_MESSAGES.serverUnavailable;
        }
        // Error genérico
        else {
          message =
            err instanceof Error && err.message ? err.message : LOGIN_ERROR_MESSAGES.generic;
        }

        setError(message);

        // Mostrar Toast con el error
        Toast.show({
          type: "error",
          text1: "Error de Login",
          text2: message,
          position: "bottom",
          visibilityTime: 4000,
          text2Style: {
            fontSize: 13,
            lineHeight: 18,
          },
        });

        return { success: false, error: message };
      }
    },
    [login],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleFieldFocus = useCallback(
    (_: keyof LoginCredentials) => {
      clearError();
    },
    [clearError],
  );

  return {
    submit,
    isLoading,
    error,
    clearError,
    handleFieldFocus,
  };
}
