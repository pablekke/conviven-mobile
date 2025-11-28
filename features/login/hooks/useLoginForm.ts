import { useMemo, useState } from "react";

import { LoginCredentials } from "@/types/user";

import { LOGIN_FORM_DEFAULTS } from "../constants";
import { LoginFormErrors } from "../types";

interface UseLoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onFocusField?: (field: keyof LoginCredentials) => void;
}

export function useLoginForm({ onSubmit, onFocusField }: UseLoginFormProps) {
  const defaults = useMemo(() => LOGIN_FORM_DEFAULTS, []);
  const [email, setEmail] = useState<string>(defaults.email ?? "");
  const [password, setPassword] = useState<string>(defaults.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      await onSubmit({ email, password });
    }
  };

  const handleFocus = (field: keyof LoginCredentials) => {
    setErrors({ ...errors, [field]: undefined });
    onFocusField?.(field);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    errors,
    handleSubmit,
    handleFocus,
  };
}
