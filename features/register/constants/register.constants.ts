export const REGISTER_CONSTANTS = {
  /** Longitud mínima de contraseña */
  MIN_PASSWORD_LENGTH: 6,
  /** Longitud máxima de contraseña */
  MAX_PASSWORD_LENGTH: 100,
  /** Año mínimo para fecha de nacimiento */
  MIN_BIRTH_YEAR: 1900,
  /** Longitud máxima de nombres */
  MAX_NAME_LENGTH: 50,
  /** Longitud máxima de email */
  MAX_EMAIL_LENGTH: 100,
  /** Patrón de validación de email */
  EMAIL_PATTERN: /\S+@\S+\.\S+/,
  /** Patrón de validación de fecha */
  DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
} as const;
