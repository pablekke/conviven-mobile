import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import { useAuth } from "@/context/AuthContext";
import type { LoginCredentials } from "@/types/user";
import { HttpError, NetworkError } from "@/services/http";

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

        // Detectar errores HTTP con códigos de estado específicos
        if (err instanceof HttpError) {
          // Error 400: formato de email inválido u otro error de validación
          if (err.status === 400) {
            message = err.message || LOGIN_ERROR_MESSAGES.invalidCredentials;
            setError(message);
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
            // Lanzar el error para que los tests puedan verificar el código de estado
            throw err;
          }
          // Error 401: credenciales inválidas (contraseña incorrecta o email no existe)
          if (err.status === 401) {
            message = LOGIN_ERROR_MESSAGES.invalidCredentials;
            setError(message);
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
            // Lanzar el error para que los tests puedan verificar el código de estado
            throw err;
          }
          // Otros errores HTTP (500, 503, etc.)
          if (err.status >= 500) {
            message = LOGIN_ERROR_MESSAGES.serverUnavailable;
          } else {
            message = err.message || LOGIN_ERROR_MESSAGES.generic;
          }
        }
        // Detectar errores de red
        else if (err instanceof NetworkError) {
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
        // Error genérico
        else {
          message =
            err instanceof Error && err.message ? err.message : LOGIN_ERROR_MESSAGES.generic;
        }

        setError(message);

        // Mostrar Toast con el error (solo si no es 400 o 401, ya que esos se lanzan arriba)
        if (!(err instanceof HttpError && (err.status === 400 || err.status === 401))) {
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
        }

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
