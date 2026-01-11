export const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === "true";

/**
 * URLs del backend
 */
const API_BASE_URL_LOCAL = process.env.EXPO_PUBLIC_API_BASE_URL_LOCAL || "http://localhost:4000";
const API_BASE_URL_PROD = process.env.EXPO_PUBLIC_API_BASE_URL_PROD || "http://localhost:4000";

export const API_BASE_URL = `${DEV_MODE ? API_BASE_URL_LOCAL : API_BASE_URL_PROD}/api`;

const wsLocal = API_BASE_URL_LOCAL.replace(/^https?/, match => (match === "https" ? "wss" : "ws"));
const wsProd = API_BASE_URL_PROD.replace(/^https?/, match => (match === "https" ? "wss" : "ws"));

export const WS_BASE_URL = DEV_MODE ? wsLocal : wsProd;

export const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT ?? "15000", 10);

export const FEED_USE_MOCK = process.env.EXPO_PUBLIC_FEED_USE_MOCK === "true";

export const MATCHES_POLLING_INTERVAL = parseInt(
  process.env.EXPO_PUBLIC_MATCHES_POLLING_INTERVAL ?? "600000",
  10,
); // 10 minutes default

export const CHAT_POLLING_INTERVAL = parseInt(
  process.env.EXPO_PUBLIC_CHAT_POLLING_INTERVAL ?? "5000",
  10,
); // 5 seconds default

/**
 * Configuración para validar el entorno
 */
export function validateEnv(): void {
  if (!API_BASE_URL) {
    throw new Error("No se pudo configurar API_BASE_URL");
  }
}
