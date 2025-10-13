export const PROFILE_CONSTANTS = {
  /** Longitud mínima recomendada para la bio */
  MIN_BIO_LENGTH: 40,
  /** Umbral de confiabilidad para nivel "top" */
  RELIABILITY_TOP_THRESHOLD: 80,
  /** Umbral de confiabilidad para nivel "confiable" */
  RELIABILITY_GOOD_THRESHOLD: 60,
  /** Puntaje base para referencias */
  REFERENCES_BASE_SCORE: 40,
  /** Incremento por cada referencia */
  REFERENCES_INCREMENT: 15,
  /** Puntaje máximo para referencias */
  REFERENCES_MAX_SCORE: 95,
} as const;

export const PROGRESS_BAR_PROMPT =
  "Próximo sprint: conectar este checklist con la barra de progreso usando el manual de puntajes del backend y los endpoints que ya tenemos documentados.";

export const DEFAULT_LOCATION_LABELS = {
  department: "Seleccioná un departamento",
  city: "Seleccioná una ciudad",
  neighborhood: "Seleccioná un barrio",
} as const;

