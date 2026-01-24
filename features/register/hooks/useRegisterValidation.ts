import { useDebouncedValidation } from "./useDebouncedValidation";

interface UseRegisterValidationProps {
  firstName: string;
  lastName: string;
  email: string;
}

export const useRegisterValidation = ({
  firstName,
  lastName,
  email,
}: UseRegisterValidationProps) => {
  const { error: firstNameError } = useDebouncedValidation({
    value: firstName,
    validate: val =>
      val.trim().length > 0 && val.trim().length < 3
        ? "El nombre debe tener al menos 3 caracteres"
        : undefined,
  });

  const { error: lastNameError } = useDebouncedValidation({
    value: lastName,
    validate: val =>
      val.trim().length > 0 && val.trim().length < 3
        ? "El apellido debe tener al menos 3 caracteres"
        : undefined,
  });

  const { error: emailError } = useDebouncedValidation({
    value: email,
    validate: val => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return val.trim().length > 0 && !emailPattern.test(val)
        ? "Formato de email inválido"
        : undefined;
    },
  });

  return {
    firstNameError,
    lastNameError,
    emailError,
  };
};
