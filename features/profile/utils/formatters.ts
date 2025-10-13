import { Gender } from "../../../types/user";

export const formatLabel = (label?: string | null, fallback: string = "No disponible") =>
  label && label !== "" ? label : fallback;

export const formatGenderValue = (gender?: Gender | string | null) => {
  if (!gender) {
    return undefined;
  }

  const normalized = gender.toString().toUpperCase();

  switch (normalized) {
    case Gender.MALE:
      return "Masculino";
    case Gender.FEMALE:
      return "Femenino";
    case Gender.NON_BINARY:
      return "No binario";
    case Gender.UNSPECIFIED:
      return "Prefiero no decir";
    default:
      return gender;
  }
};
