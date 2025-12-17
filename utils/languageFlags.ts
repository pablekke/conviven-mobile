import type { iconNames } from "react-native-ico-flags";

const stripDiacritics = (value: string) => {
  // RN/Hermes soporta normalize en la práctica, pero dejamos fallback por seguridad.
  try {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return value;
  }
};

/**
 * Devuelve el nombre de bandera (react-native-ico-flags) para un idioma.
 * Acepta códigos (es/en/pt/...), valores del enum (Spanish/English/...) o labels (Español/Inglés/...).
 */
export const getFlagIconNameForLanguage = (raw: string): iconNames => {
  const v = stripDiacritics(String(raw ?? ""))
    .trim()
    .toLowerCase();

  if (!v) return "united-nations";

  // Códigos ISO cortos
  if (v === "es") return "spain";
  if (v === "en") return "united-kingdom";
  if (v === "pt") return "portugal";
  if (v === "fr") return "france";
  if (v === "it") return "italy";
  if (v === "de") return "germany";

  // Enum values (English names)
  if (v === "spanish") return "spain";
  if (v === "english") return "united-kingdom";
  if (v === "portuguese") return "portugal";
  if (v === "french") return "france";
  if (v === "italian") return "italy";
  if (v === "german") return "germany";
  if (v === "other") return "united-nations";

  // Labels ES
  if (v.includes("espanol")) return "spain";
  if (v.includes("ingles")) return "united-kingdom";
  if (v.includes("portugues")) return "portugal";
  if (v.includes("frances")) return "france";
  if (v.includes("italiano")) return "italy";
  if (v.includes("aleman")) return "germany";

  // Fallback genérico
  return "united-nations";
};



