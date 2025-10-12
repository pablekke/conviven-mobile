/**
 * Constantes para el módulo Chat según la API
 */
export const CHAT_CONSTANTS = {
  /** Longitud de un mensaje según la API (1-1000 caracteres) */
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 1000,
  /** Intervalo de refresco de conversaciones (30 segundos) */
  REFRESH_INTERVAL: 30000,
  /** Timeout para indicador de escritura (3 segundos) */
  TYPING_INDICATOR_TIMEOUT: 3000,
} as const;
