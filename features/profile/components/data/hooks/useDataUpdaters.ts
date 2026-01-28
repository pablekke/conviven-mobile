import { useAuth } from "../../../../../context/AuthContext";
import { useCallback } from "react";

export const useDataUpdaters = (
  setFirstNameState: (value: string) => void,
  setLastNameState: (value: string) => void,
  setBioState: (value: string) => void,
  setOccupationState: (value: string) => void,
  setEducationState: (value: string) => void,
  setDraftGender: (value: string | null) => void,
) => {
  const { user, updateUser } = useAuth();

  const setFirstName = useCallback(
    (value: string) => {
      const filteredText = value.replace(/[0-9]/g, "");
      setFirstNameState(filteredText);
      updateUser({ firstName: filteredText });
    },
    [updateUser, setFirstNameState],
  );

  const setLastName = useCallback(
    (value: string) => {
      let filtered = value.replace(/[^a-zA-ZñáéíóúÑÁÉÍÓÚüÜ ]/gi, "");

      if (filtered.length > 17) {
        filtered = filtered.substring(0, 17);
      }

      const spaces = (filtered.match(/ /g) || []).length;
      if (spaces > 2) {
        const parts = filtered.split(" ");
        filtered = parts.slice(0, 3).join(" ");
      }

      const finalValue = filtered.replace(/\s\s+/g, " ").replace(/^\s/, "");
      setLastNameState(finalValue);
      updateUser({ lastName: finalValue });
    },
    [updateUser, setLastNameState],
  );

  const setBio = useCallback(
    (value: string) => {
      setBioState(value);
      updateUser({
        profile: {
          ...(user?.profile as any),
          bio: value,
        },
      });
    },
    [updateUser, user?.profile, setBioState],
  );

  const setOccupation = useCallback(
    (value: string) => {
      setOccupationState(value);
      updateUser({
        profile: {
          ...(user?.profile as any),
          occupation: value,
        },
      });
    },
    [updateUser, user?.profile, setOccupationState],
  );

  const setEducation = useCallback(
    (value: string) => {
      setEducationState(value);
      updateUser({
        profile: {
          ...(user?.profile as any),
          education: value,
        },
      });
    },
    [updateUser, user?.profile, setEducationState],
  );

  const setBirthDate = useCallback(
    (value: string) => {
      updateUser({ birthDate: value });
    },
    [updateUser],
  );

  const setGender = useCallback(
    (value: string) => {
      setDraftGender(value);
      updateUser({ gender: value as any });
    },
    [updateUser, setDraftGender],
  );

  return {
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    setGender,
  };
};
