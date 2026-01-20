import { useAuth } from "../../../../../context/AuthContext";
import type { OriginalDataRef } from "./useDataState";
import { useCallback } from "react";

const normalizeValue = (val: string | null | undefined): string => {
  return (val || "").trim();
};

export const useDataChanges = (
  firstName: string,
  lastName: string,
  occupation: string,
  education: string,
  bio: string,
  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null,
  draftGender: string | null,
  originalDataRef: React.MutableRefObject<OriginalDataRef>,
  normalizeBirthDate: (dateString: string | null | undefined) => string,
) => {
  const { user } = useAuth();

  const dataHasChanges =
    normalizeValue(firstName) !== normalizeValue(originalDataRef.current.firstName) ||
    normalizeValue(lastName) !== normalizeValue(originalDataRef.current.lastName) ||
    normalizeBirthDate(user?.birthDate) !== normalizeValue(originalDataRef.current.birthDate) ||
    normalizeValue(draftGender || user?.gender) !==
      normalizeValue(originalDataRef.current.gender) ||
    normalizeValue(occupation) !== normalizeValue(originalDataRef.current.occupation) ||
    normalizeValue(education) !== normalizeValue(originalDataRef.current.education) ||
    normalizeValue(bio) !== normalizeValue(originalDataRef.current.bio) ||
    (draftLocation !== null &&
      draftLocation.neighborhoodId !== originalDataRef.current.neighborhoodId);

  const getChanges = useCallback(() => {
    const changes: any = {};
    const original = originalDataRef.current;

    if (normalizeValue(firstName) !== normalizeValue(original.firstName))
      changes.firstName = firstName;
    if (normalizeValue(lastName) !== normalizeValue(original.lastName)) changes.lastName = lastName;

    if (normalizeBirthDate(user?.birthDate) !== normalizeValue(original.birthDate)) {
      changes.birthDate = normalizeBirthDate(user?.birthDate);
    }

    const currentGender = draftGender !== null ? draftGender : user?.gender;
    if (normalizeValue(currentGender) !== normalizeValue(original.gender)) {
      changes.gender = currentGender;
    }

    if (draftLocation && draftLocation.neighborhoodId !== original.neighborhoodId) {
      changes.location = draftLocation;
    }

    if (normalizeValue(occupation) !== normalizeValue(original.occupation))
      changes.occupation = occupation;
    if (normalizeValue(education) !== normalizeValue(original.education))
      changes.education = education;
    if (normalizeValue(bio) !== normalizeValue(original.bio)) changes.bio = bio;

    return changes;
  }, [
    firstName,
    lastName,
    user?.birthDate,
    user?.gender,
    draftGender,
    draftLocation,
    occupation,
    education,
    bio,
    originalDataRef,
    normalizeBirthDate,
  ]);

  return {
    dataHasChanges,
    getChanges,
  };
};
