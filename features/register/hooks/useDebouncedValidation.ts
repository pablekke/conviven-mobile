import { useState, useEffect, useRef } from "react";

export interface DebouncedValidationOptions<T> {
  value: T;
  validate: (value: T) => string | undefined;
  delay?: number;
}

export const useDebouncedValidation = <T>({
  value,
  validate,
  delay = 1000,
}: DebouncedValidationOptions<T>) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const timerRef = useRef<any>(null);
  const isFirstRender = useRef(true);
  const validateRef = useRef(validate);

  useEffect(() => {
    validateRef.current = validate;
  }, [validate]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setError(undefined);

    timerRef.current = setTimeout(() => {
      const validationError = validateRef.current(value);
      setError(validationError);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return { error, setError };
};
