import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../../context/AuthContext";

export interface DataState {
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  education: string;
}

export interface DraftState {
  location: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;
  gender: string | null;
}

export interface OriginalDataRef {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  occupation: string;
  education: string;
  bio: string;
  neighborhoodId: string | null;
  cityId: string | null;
  departmentId: string | null;
}

export const useDataState = () => {
  const { user } = useAuth();

  const normalizeBirthDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  const originalDataRef = useRef<OriginalDataRef>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    birthDate: normalizeBirthDate(user?.birthDate) || "",
    gender: user?.gender || "",
    occupation: user?.profile?.occupation || "",
    education: user?.profile?.education || "",
    bio: user?.profile?.bio || "",
    neighborhoodId: user?.location?.neighborhood?.id || null,
    cityId: user?.location?.city?.id || null,
    departmentId: user?.location?.department?.id || null,
  });

  const [firstName, setFirstNameState] = useState(user?.firstName || "");
  const [lastName, setLastNameState] = useState(user?.lastName || "");
  const [bio, setBioState] = useState(user?.profile?.bio || "");
  const [occupation, setOccupationState] = useState(user?.profile?.occupation || "");
  const [education, setEducationState] = useState(user?.profile?.education || "");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);

  const [draftLocation, setDraftLocation] = useState<DraftState["location"]>(null);
  const [draftGender, setDraftGender] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const normalizedBirthDate = normalizeBirthDate(user.birthDate);
      setFirstNameState(user.firstName || "");
      setLastNameState(user.lastName || "");
      setBioState(user.profile?.bio || "");
      setOccupationState(user.profile?.occupation || "");
      setEducationState(user.profile?.education || "");
      setDraftLocation(null);
      setDraftGender(null);
      originalDataRef.current = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthDate: normalizedBirthDate,
        gender: user.gender || "",
        occupation: user.profile?.occupation || "",
        education: user.profile?.education || "",
        bio: user.profile?.bio || "",
        neighborhoodId: user.location?.neighborhood?.id || null,
        cityId: user.location?.city?.id || null,
        departmentId: user.location?.department?.id || null,
      };
    }
  }, [user?.id]);

  return {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    locationModalVisible,
    dataSaving,
    draftLocation,
    draftGender,
    originalDataRef,
    setFirstNameState,
    setLastNameState,
    setBioState,
    setOccupationState,
    setEducationState,
    setLocationModalVisible,
    setDataSaving,
    setDraftLocation,
    setDraftGender,
    normalizeBirthDate,
  };
};
