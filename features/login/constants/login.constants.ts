export const LOGIN_FORM_DEFAULTS = {
  email: "firulete@ejemplo.com",
  password: "contraseña123",
} as const;

export const LOGIN_ERROR_MESSAGES = {
  generic: "No pudimos iniciar sesión. Reintentá en unos segundos.",
  network:
    "No pudimos conectarnos al servidor. Verificá tu conexión a internet e intentá de nuevo.",
  serverUnavailable:
    "El servidor no está disponible en este momento. Por favor, intentá más tarde.",
  invalidCredentials: "Email o contraseña incorrectos. Verificá tus datos e intentá de nuevo.",
  timeout: "La solicitud tardó demasiado. Verificá tu conexión e intentá de nuevo.",
} as const;

export const LOGIN_COPY = {
  forgotPassword: "Esta función pronto estará disponible.",
} as const;
