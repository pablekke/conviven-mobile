import { useRegister, useRegisterValidation } from "../hooks";
import { RegisterCredentials } from "../types";
import { useState, useCallback } from "react";
import { Gender } from "../../../types/user";

interface UseRegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
}

export const useRegisterForm = ({ onSubmit }: UseRegisterFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [neighborhoodName, setNeighborhoodName] = useState("");

  const { validateForm, errors: submitErrors, clearErrors, isLoading } = useRegister();

  const sanitizeName = useCallback((text: string) => {
    return text.replace(/[^a-zA-ZñáéíóúÑÁÉÍÓÚüÜ]/gi, "");
  }, []);

  const sanitizeLastName = useCallback((text: string) => {
    let filtered = text.replace(/[^a-zA-ZñáéíóúÑÁÉÍÓÚüÜ ]/gi, "");

    if (filtered.length > 17) {
      filtered = filtered.substring(0, 17);
    }

    const spaces = (filtered.match(/ /g) || []).length;
    if (spaces > 2) {
      const parts = filtered.split(" ");
      filtered = parts.slice(0, 3).join(" ");
    }

    return filtered.replace(/\s\s+/g, " ").replace(/^\s/, "");
  }, []);

  const sanitizeGeneral = useCallback((text: string) => {
    return text.replace(/[^\w\sñáéíóúÑÁÉÍÓÚüÜ!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi, "");
  }, []);

  const { firstNameError, lastNameError, emailError } = useRegisterValidation({
    firstName,
    lastName,
    email,
  });

  const handleSubmit = async () => {
    const cleaned = {
      firstName: firstName.trim(),
      lastName: lastName.trimEnd(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      birthDate,
      gender,
      departmentId,
      cityId,
      neighborhoodId,
    };

    if (validateForm(cleaned)) {
      await onSubmit({
        email: cleaned.email,
        password: cleaned.password,
        firstName: cleaned.firstName,
        lastName: cleaned.lastName,
        birthDate: cleaned.birthDate,
        gender: cleaned.gender as Gender,
        departmentId: cleaned.departmentId,
        cityId: cleaned.cityId,
        neighborhoodId: cleaned.neighborhoodId,
      });
    }
  };

  const handleNeighborhoodSelect = (neighborhood: any) => {
    setNeighborhoodId(neighborhood.id);
    setNeighborhoodName(neighborhood.name);
    setCityId(neighborhood.cityId || "");
    setDepartmentId(neighborhood.departmentId || "");
    clearErrors();
  };

  return {
    state: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      birthDate,
      gender,
      neighborhoodId,
      neighborhoodName,
    },
    actions: {
      setFirstName: (val: string) => setFirstName(sanitizeName(val)),
      setLastName: (val: string) => setLastName(sanitizeLastName(val)),
      setEmail: (val: string) => setEmail(sanitizeGeneral(val).replace(/\s/g, "")),
      setPassword: (val: string) => setPassword(sanitizeGeneral(val)),
      setConfirmPassword: (val: string) => setConfirmPassword(sanitizeGeneral(val)),
      setBirthDate,
      setGender,
      handleNeighborhoodSelect,
      handleSubmit,
    },
    errors: {
      firstName: firstNameError || submitErrors.firstName,
      lastName: lastNameError || submitErrors.lastName,
      email: emailError || submitErrors.email,
      password: submitErrors.password,
      confirmPassword: submitErrors.confirmPassword,
      birthDate: submitErrors.birthDate,
      gender: submitErrors.gender,
      neighborhood: submitErrors.neighborhoodId,
    },
    loading: {
      form: isLoading,
    },
  };
};
