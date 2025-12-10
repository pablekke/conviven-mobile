import LocationService from "../../../../../services/locationService";
import { useCallback, useEffect, useState, useRef } from "react";
import ProfileService from "../../../services/profileService";
import userProfileUpdateService from "../../../services/userProfileUpdateService";
import { useAuth } from "../../../../../context/AuthContext";

export interface UseDataPreferencesLogicReturn {
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  education: string;
  birthDate: string | null;
  gender: string | null;
  locationModalVisible: boolean;
  setLocationModalVisible: (visible: boolean) => void;
  dataHasChanges: boolean;
  dataSaving: boolean;

  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBio: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
  setBirthDate: (value: string) => void;
  setGender: (value: string) => void;

  handleLocationConfirm: (
    departmentId: string,
    cityId: string,
    neighborhoodId: string,
  ) => Promise<void>;

  getLocationLabel: () => string;
  calculateAge: () => number | null;

  saveDataPrefs: () => Promise<void>;
  resetDataPrefs: () => void;
}

export const useDataPreferencesLogic = (): UseDataPreferencesLogicReturn => {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstNameState] = useState(user?.firstName || "");
  const [lastName, setLastNameState] = useState(user?.lastName || "");
  const [bio, setBioState] = useState(user?.bio || "");
  const [occupation, setOccupationState] = useState(user?.profile?.occupation || "");
  const [education, setEducationState] = useState(user?.profile?.education || "");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);

  const originalDataRef = useRef<{
    firstName: string;
    lastName: string;
    phone: string;
    birthDate: string;
    gender: string;
    occupation: string;
    education: string;
    bio: string;
  }>({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    gender: "",
    occupation: "",
    education: "",
    bio: "",
  });

  const normalizeBirthDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  useEffect(() => {
    if (user) {
      setFirstNameState(user.firstName || "");
      setLastNameState(user.lastName || "");
      setBioState(user.bio || "");
      setOccupationState(user.profile?.occupation || "");
      setEducationState(user.profile?.education || "");
      originalDataRef.current = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        birthDate: normalizeBirthDate(user.birthDate) || "",
        gender: user.gender || "",
        occupation: user.profile?.occupation || "",
        education: user.profile?.education || "",
        bio: user.bio || "",
      };
    }
  }, [user?.id]);

  const dataHasChanges =
    (firstName || "") !== (originalDataRef.current.firstName || "") ||
    (lastName || "") !== (originalDataRef.current.lastName || "") ||
    normalizeBirthDate(user?.birthDate) !== (originalDataRef.current.birthDate || "") ||
    (user?.gender || "") !== (originalDataRef.current.gender || "") ||
    (occupation || "") !== (originalDataRef.current.occupation || "") ||
    (education || "") !== (originalDataRef.current.education || "") ||
    (bio || "") !== (originalDataRef.current.bio || "");

  const setFirstName = useCallback(
    (value: string) => {
      const filteredText = value.replace(/[0-9]/g, "");
      setFirstNameState(filteredText);
      updateUser({ firstName: filteredText });
    },
    [updateUser],
  );

  const setLastName = useCallback(
    (value: string) => {
      const filteredText = value.replace(/[0-9]/g, "");
      setLastNameState(filteredText);
      updateUser({ lastName: filteredText });
    },
    [updateUser],
  );

  const setBio = useCallback(
    (value: string) => {
      setBioState(value);
      updateUser({ bio: value });
    },
    [updateUser],
  );

  const setOccupation = useCallback(
    (value: string) => {
      setOccupationState(value);
      if (user?.profile) {
        updateUser({
          profile: {
            ...user.profile,
            occupation: value,
          },
        });
      }
    },
    [updateUser, user],
  );

  const setEducation = useCallback(
    (value: string) => {
      setEducationState(value);
      if (user?.profile) {
        updateUser({
          profile: {
            ...user.profile,
            education: value,
          },
        });
      }
    },
    [updateUser, user],
  );

  const setBirthDate = useCallback(
    (value: string) => {
      updateUser({ birthDate: value });
    },
    [updateUser],
  );

  const setGender = useCallback(
    (value: string) => {
      updateUser({ gender: value as any });
      if (user) {
        ProfileService.update(user.id, { gender: value as any })
          .then(updatedUser => {
            updateUser(updatedUser);
          })
          .catch(error => {
            console.error("Error actualizando género:", error);
          });
      }
    },
    [updateUser, user],
  );

  const calculateAge = useCallback((): number | null => {
    if (!user?.birthDate) return null;
    try {
      const birth = new Date(user.birthDate);
      if (isNaN(birth.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  }, [user?.birthDate]);

  const getLocationLabel = useCallback((): string => {
    if (user?.neighborhoodName) return user.neighborhoodName;
    if (user?.cityName) return user.cityName;
    if (user?.departmentName) return user.departmentName;
    return "Seleccionar";
  }, [user]);

  const handleLocationConfirm = useCallback(
    async (departmentId: string, cityId: string, neighborhoodId: string) => {
      if (!user) return;

      try {
        const [department, city, neighborhood] = await Promise.all([
          LocationService.getDepartment(departmentId),
          LocationService.getCity(cityId),
          LocationService.getNeighborhood(neighborhoodId),
        ]);

        const updatedUser = await ProfileService.update(user.id, {
          departmentId,
          cityId,
          neighborhoodId,
          departmentName: department.name,
          cityName: city.name,
          neighborhoodName: neighborhood.name,
        });

        updateUser(updatedUser);
      } catch (error) {
        console.error("Error updating location:", error);
      }
    },
    [user, updateUser],
  );

  const saveDataPrefs = useCallback(async () => {
    if (!user || !dataHasChanges) return Promise.resolve();

    setDataSaving(true);
    try {
      const payload: any = {};
      const original = originalDataRef.current;

      if ((firstName || "") !== (original.firstName || "")) {
        payload.firstName = firstName;
      }
      if ((lastName || "") !== (original.lastName || "")) {
        payload.lastName = lastName;
      }
      const normalizedUserBirthDate = normalizeBirthDate(user.birthDate);
      const normalizedOriginalBirthDate = original.birthDate;
      if (normalizedUserBirthDate !== normalizedOriginalBirthDate) {
        payload.birthDate = normalizedUserBirthDate;
      }
      if ((user.gender || "") !== (original.gender || "")) {
        payload.gender = user.gender;
      }
      const profilePayload: any = {};
      if ((occupation || "") !== (original.occupation || "")) {
        profilePayload.occupation = occupation;
      }
      if ((education || "") !== (original.education || "")) {
        profilePayload.education = education;
      }

      let finalUpdatedUser = user;

      if (Object.keys(profilePayload).length > 0) {
        finalUpdatedUser = await userProfileUpdateService.updateUserProfile(profilePayload);
        updateUser(finalUpdatedUser);
      }
      if ((bio || "") !== (original.bio || "")) {
        payload.bio = bio;
      }

      if (Object.keys(payload).length > 0) {
        finalUpdatedUser = await ProfileService.update(user.id, payload);
        updateUser(finalUpdatedUser);
      }

      if (Object.keys(profilePayload).length > 0 || Object.keys(payload).length > 0) {
        originalDataRef.current = {
          firstName: finalUpdatedUser.firstName || "",
          lastName: finalUpdatedUser.lastName || "",
          phone: finalUpdatedUser.phone || "",
          birthDate: normalizeBirthDate(finalUpdatedUser.birthDate) || "",
          gender: finalUpdatedUser.gender || "",
          occupation: finalUpdatedUser.profile?.occupation || "",
          education: finalUpdatedUser.profile?.education || "",
          bio: finalUpdatedUser.bio || "",
        };
      }
    } catch (error) {
      console.error("Error saving data preferences:", error);
      throw error;
    } finally {
      setDataSaving(false);
    }
  }, [user, firstName, lastName, occupation, education, bio, dataHasChanges, updateUser]);

  const resetDataPrefs = useCallback(() => {
    if (!user) return;
    const original = originalDataRef.current;
    setFirstNameState(original.firstName);
    setLastNameState(original.lastName);
    setOccupationState(original.occupation);
    setEducationState(original.education);
    setBioState(original.bio);
    if (user.profile) {
      updateUser({
        firstName: original.firstName,
        lastName: original.lastName,
        phone: original.phone,
        birthDate: original.birthDate,
        gender: original.gender as any,
        profile: {
          ...user.profile,
          occupation: original.occupation,
          education: original.education,
        },
        bio: original.bio,
      });
    } else {
      updateUser({
        firstName: original.firstName,
        lastName: original.lastName,
        phone: original.phone,
        birthDate: original.birthDate,
        gender: original.gender as any,
        bio: original.bio,
      });
    }
  }, [user, updateUser]);

  return {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    birthDate: user?.birthDate || null,
    gender: user?.gender || null,
    locationModalVisible,
    setLocationModalVisible,
    dataHasChanges,
    dataSaving,
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    setGender,
    handleLocationConfirm,
    getLocationLabel,
    calculateAge,
    saveDataPrefs,
    resetDataPrefs,
  };
};
