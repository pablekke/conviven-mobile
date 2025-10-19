import { useCallback, useState } from "react";
import { registerService } from "../services";
import { RegisterCredentials, RegisterFormErrors } from "../types";
import { REGISTER_CONSTANTS } from "../constants";
import { Gender } from "../../../types/user";

export interface UseRegisterReturn {
  register: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  validateForm: (formData: any) => boolean;
  errors: RegisterFormErrors;
  clearErrors: () => void;
}

/**
 * Hook para manejar el registro de usuarios
 */
export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const validateForm = useCallback((formData: any): boolean => {
    const newErrors: RegisterFormErrors = {};

    // Validar nombre
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (formData.firstName.length > REGISTER_CONSTANTS.MAX_NAME_LENGTH) {
      newErrors.firstName = `El nombre no puede tener más de ${REGISTER_CONSTANTS.MAX_NAME_LENGTH} caracteres`;
    }

    // Validar apellido
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (formData.lastName.length > REGISTER_CONSTANTS.MAX_NAME_LENGTH) {
      newErrors.lastName = `El apellido no puede tener más de ${REGISTER_CONSTANTS.MAX_NAME_LENGTH} caracteres`;
    }

    // Validar email
    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!REGISTER_CONSTANTS.EMAIL_PATTERN.test(formData.email)) {
      newErrors.email = "El formato del email es inválido";
    } else if (formData.email.length > REGISTER_CONSTANTS.MAX_EMAIL_LENGTH) {
      newErrors.email = `El email no puede tener más de ${REGISTER_CONSTANTS.MAX_EMAIL_LENGTH} caracteres`;
    }

    // Validar contraseña
    if (!formData.password?.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < REGISTER_CONSTANTS.MIN_PASSWORD_LENGTH) {
      newErrors.password = `La contraseña debe tener al menos ${REGISTER_CONSTANTS.MIN_PASSWORD_LENGTH} caracteres`;
    } else if (formData.password.length > REGISTER_CONSTANTS.MAX_PASSWORD_LENGTH) {
      newErrors.password = `La contraseña no puede tener más de ${REGISTER_CONSTANTS.MAX_PASSWORD_LENGTH} caracteres`;
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = "La confirmación de contraseña es requerida";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar fecha de nacimiento
    if (!formData.birthDate?.trim()) {
      newErrors.birthDate = "La fecha de nacimiento es requerida";
    } else {
      const selectedDate = new Date(formData.birthDate);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, 0, 1);
      const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

      if (selectedDate > maxDate) {
        newErrors.birthDate = "Debes tener al menos 16 años";
      } else if (selectedDate < minDate) {
        newErrors.birthDate = "La fecha debe ser posterior a hace 100 años";
      } else if (!REGISTER_CONSTANTS.DATE_PATTERN.test(formData.birthDate)) {
        newErrors.birthDate = "Formato de fecha inválido";
      }
    }

    // Validar género
    if (!formData.gender?.trim()) {
      newErrors.gender = "El género es requerido";
    } else if (!Object.values(Gender).includes(formData.gender as Gender)) {
      newErrors.gender = "Selecciona un género válido";
    }

    // Validar ubicación
    if (!formData.departmentId?.trim()) {
      newErrors.departmentId = "El departamento es requerido";
    }

    if (!formData.cityId?.trim()) {
      newErrors.cityId = "La ciudad es requerida";
    }

    if (!formData.neighborhoodId?.trim()) {
      newErrors.neighborhoodId = "El barrio es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      await registerService.register(credentials);
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err instanceof Error ? err : new Error("Error en el registro"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setError(null);
  }, []);

  return {
    register,
    isLoading,
    error,
    validateForm,
    errors,
    clearErrors,
  };
};
