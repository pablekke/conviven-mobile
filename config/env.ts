export const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === "true";

/**
 * URLs del backend
 */
const API_BASE_URL_LOCAL = process.env.EXPO_PUBLIC_API_BASE_URL_LOCAL!;
const API_BASE_URL_PROD = process.env.EXPO_PUBLIC_API_BASE_URL_PROD!;

export const API_BASE_URL = `${DEV_MODE ? API_BASE_URL_LOCAL : API_BASE_URL_PROD}/api`;

export const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT ?? "15000", 10);

export const FEED_USE_MOCK = process.env.EXPO_PUBLIC_FEED_USE_MOCK === "true";

/**
 * Configuración para validar el entorno
 */
export function validateEnv(): void {
  if (!API_BASE_URL) {
    throw new Error("No se pudo configurar API_BASE_URL");
  }
}
