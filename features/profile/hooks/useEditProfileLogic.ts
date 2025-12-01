import { useSearchPreferencesForm } from "./useSearchPreferencesForm";
import { useState, useEffect, useCallback, useRef } from "react";
import { QUESTION_OPTIONS } from "../constants/questionOptions";
import { useUserProfileData } from "./useUserProfileData";
import ProfileService from "../services/profileService";
import { useAuth } from "../../../context/AuthContext";
import { useSearchFilters } from "./useSearchFilters";
import { useCachedProfile } from "./useCachedProfile";
import type { UserProfileData } from "../interfaces";

export const findOptionLabel = (
  value: string,
  options: { value: string; label: string }[],
): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label ?? "";
};

export const useEditProfileLogic = () => {
  const [aboutText, setAboutText] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [genders, setGenders] = useState<string[]>([]);
  const [userFieldsChanged, setUserFieldsChanged] = useState(false);
  const originalUserFieldsRef = useRef<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    profession?: string;
    hobby?: string;
    bio?: string;
  }>({});

  const { user, updateUser } = useAuth();
  const { fullProfile } = useCachedProfile();
  const {
    profileData,
    saving,
    hasChanges: profileHasChanges,
    updateProfileData,
    saveProfileData,
    resetToUserData,
  } = useUserProfileData();

  useEffect(() => {
    if (user) {
      originalUserFieldsRef.current = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
        profession: user.profession || "",
        hobby: user.hobby || "",
        bio: user.bio || "",
      };
      setUserFieldsChanged(false);
    }
  }, [user?.id]);
  useEffect(() => {
    if (!user) {
      setUserFieldsChanged(false);
      return;
    }

    const original = originalUserFieldsRef.current;
    const hasChanges =
      (user.firstName || "") !== (original.firstName || "") ||
      (user.lastName || "") !== (original.lastName || "") ||
      (user.phone || "") !== (original.phone || "") ||
      (user.birthDate || "") !== (original.birthDate || "") ||
      (user.gender || "") !== (original.gender || "") ||
      (user.profession || "") !== (original.profession || "") ||
      (user.hobby || "") !== (original.hobby || "") ||
      (user.bio || "") !== (original.bio || "");

    setUserFieldsChanged(hasChanges);
  }, [
    user?.firstName,
    user?.lastName,
    user?.phone,
    user?.birthDate,
    user?.gender,
    user?.profession,
    user?.hobby,
    user?.bio,
  ]);

  const {
    formData: searchPrefsData,
    saving: searchPrefsSaving,
    updateFormData: updateSearchPrefs,
    resetFormData: resetSearchPrefs,
    saveFormData: saveSearchPrefs,
    hasChanges: searchPrefsHasChanges,
  } = useSearchPreferencesForm();

  const {
    formData: searchFiltersData,
    saving: searchFiltersSaving,
    updateFormData: updateSearchFilters,
    resetFormData: resetSearchFilters,
    saveFormData: saveSearchFilters,
    hasChanges: searchFiltersHasChanges,
  } = useSearchFilters();

  useEffect(() => {
    if (aboutText !== profileData.bio) {
      updateProfileData("bio", aboutText);
    }
  }, [aboutText, profileData.bio, updateProfileData]);

  useEffect(() => {
    if (fullProfile?.profile) {
      const profile = fullProfile.profile;
      if (profile.bio) setAboutText(profile.bio);

      const mapped: Record<string, string> = {};

      if (user?.gender) {
        mapped.gender = findOptionLabel(user.gender, QUESTION_OPTIONS.gender) || "Seleccionar";
      }

      if (profile.smokesCigarettes) {
        mapped.smoking = findOptionLabel(profile.smokesCigarettes, QUESTION_OPTIONS.smoking);
      }
      if (profile.smokesWeed) {
        mapped.marijuana = findOptionLabel(profile.smokesWeed, QUESTION_OPTIONS.marijuana);
      }
      if (profile.alcohol) {
        mapped.alcohol = findOptionLabel(profile.alcohol, QUESTION_OPTIONS.alcohol);
      }
      if (profile.petsOwned) {
        const petsValue = profile.petsOwned.length === 0 ? "none" : profile.petsOwned[0];
        mapped.pets = findOptionLabel(petsValue, QUESTION_OPTIONS.pets);
      }
      if (profile.petsOk) {
        mapped.acceptPets = findOptionLabel(profile.petsOk, QUESTION_OPTIONS.acceptPets);
      }
      if (profile.tidiness) {
        mapped.tidiness = findOptionLabel(profile.tidiness, QUESTION_OPTIONS.tidiness);
      }
      if (profile.guestsFreq) {
        mapped.visitors = findOptionLabel(profile.guestsFreq, QUESTION_OPTIONS.visitors);
      }
      if (profile.schedule) {
        mapped.sleepRoutine = findOptionLabel(profile.schedule, QUESTION_OPTIONS.sleepRoutine);
        mapped.workRoutine = findOptionLabel(profile.schedule, QUESTION_OPTIONS.workRoutine);
      }

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [fullProfile, user]);

  // Cargar search preferences
  useEffect(() => {
    if (searchPrefsData) {
      const mapped: Record<string, string> = {};
      mapped.noCigarettes =
        findOptionLabel(
          searchPrefsData.noCigarettes ? "true" : "false",
          QUESTION_OPTIONS.noCigarettes,
        ) || "Seleccionar";
      mapped.noWeed =
        findOptionLabel(searchPrefsData.noWeed ? "true" : "false", QUESTION_OPTIONS.noWeed) ||
        "Seleccionar";
      const petsValue = searchPrefsData.noPets
        ? "noPets"
        : searchPrefsData.petsRequired
          ? "petsRequired"
          : "none";
      mapped.petsPreference =
        findOptionLabel(petsValue, QUESTION_OPTIONS.petsPreference) || "Seleccionar";

      if (searchPrefsData.tidinessMin) {
        mapped.tidinessMin =
          findOptionLabel(searchPrefsData.tidinessMin, QUESTION_OPTIONS.tidinessMin) ||
          "Seleccionar";
      }
      if (searchPrefsData.schedulePref) {
        mapped.schedulePref =
          findOptionLabel(searchPrefsData.schedulePref, QUESTION_OPTIONS.schedulePref) ||
          "Seleccionar";
      }
      if (searchPrefsData.guestsMax) {
        mapped.guestsMax =
          findOptionLabel(searchPrefsData.guestsMax, QUESTION_OPTIONS.guestsMax) || "Seleccionar";
      }
      if (searchPrefsData.musicMax) {
        mapped.musicMax =
          findOptionLabel(searchPrefsData.musicMax, QUESTION_OPTIONS.musicMax) || "Seleccionar";
      }

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [searchPrefsData]);

  // Cargar search filters
  useEffect(() => {
    if (searchFiltersData) {
      const mapped: Record<string, string> = {};

      if (searchFiltersData.genderPref?.length > 0) {
        const firstGender = searchFiltersData.genderPref[0];
        mapped.genderPref =
          findOptionLabel(firstGender, QUESTION_OPTIONS.genderPref) || "Seleccionar";
      }

      mapped.onlyWithPhoto =
        findOptionLabel(
          searchFiltersData.onlyWithPhoto ? "true" : "false",
          QUESTION_OPTIONS.onlyWithPhoto,
        ) || "Seleccionar";

      setMinAge(searchFiltersData.minAge.toString());
      setMaxAge(searchFiltersData.maxAge.toString());
      setBudgetMin(searchFiltersData.budgetMin.toString());
      setBudgetMax(searchFiltersData.budgetMax.toString());
      setGenders(searchFiltersData.genders || []);

      setSelectedAnswers(prev => ({ ...prev, ...mapped }));
    }
  }, [searchFiltersData]);

  const handleUpdate = useCallback(
    (question: string, value: string) => {
      const profileMapping: Record<string, keyof UserProfileData> = {
        smoking: "smokingStatus",
        marijuana: "marijuanaStatus",
        alcohol: "alcoholStatus",
        pets: "hasPets",
        acceptPets: "acceptsPets",
        tidiness: "tidinessLevel",
        visitors: "socialLife",
        sleepRoutine: "sleepTime",
        workRoutine: "workSchedule",
      };

      if (profileMapping[question]) {
        updateProfileData(profileMapping[question], value);
      } else if (question === "noCigarettes") {
        updateSearchPrefs("noCigarettes", value === "true");
      } else if (question === "noWeed") {
        updateSearchPrefs("noWeed", value === "true");
      } else if (question === "petsPreference") {
        updateSearchPrefs("noPets", value === "noPets");
        updateSearchPrefs("petsRequired", value === "petsRequired");
      } else if (["tidinessMin", "schedulePref", "guestsMax", "musicMax"].includes(question)) {
        updateSearchPrefs(question as any, value);
      } else if (question === "genderPref") {
        updateSearchFilters("genderPref", [value]);
      } else if (question === "onlyWithPhoto") {
        updateSearchFilters("onlyWithPhoto", value === "true");
      } else if (question === "genders") {
        updateSearchFilters("genders", value.split(","));
      } else if (question === "gender") {
        // Actualizar género del usuario directamente
        if (user) {
          ProfileService.update(user.id, { gender: value as any })
            .then(updatedUser => {
              updateUser(updatedUser);
              // Actualizar el label en selectedAnswers
              setSelectedAnswers(prev => ({
                ...prev,
                gender: findOptionLabel(value, QUESTION_OPTIONS.gender) || "Seleccionar",
              }));
            })
            .catch(error => {
              console.error("Error actualizando género:", error);
            });
        }
      }
    },
    [updateProfileData, updateSearchPrefs, updateSearchFilters, user, updateUser],
  );

  const saveUserFields = useCallback(async (): Promise<void> => {
    if (!user || !userFieldsChanged) return Promise.resolve();

    const payload: any = {};
    const original = originalUserFieldsRef.current;

    if ((user.firstName || "") !== (original.firstName || "")) {
      payload.firstName = user.firstName;
    }
    if ((user.lastName || "") !== (original.lastName || "")) {
      payload.lastName = user.lastName;
    }
    if ((user.phone || "") !== (original.phone || "")) {
      payload.phone = user.phone;
    }
    if ((user.birthDate || "") !== (original.birthDate || "")) {
      payload.birthDate = user.birthDate;
    }
    if ((user.gender || "") !== (original.gender || "")) {
      payload.gender = user.gender;
    }
    if ((user.profession || "") !== (original.profession || "")) {
      payload.profession = user.profession;
    }
    if ((user.hobby || "") !== (original.hobby || "")) {
      payload.hobby = user.hobby;
    }
    if ((user.bio || "") !== (original.bio || "")) {
      payload.bio = user.bio;
    }

    if (Object.keys(payload).length > 0) {
      const updatedUser = await ProfileService.update(user.id, payload);
      updateUser(updatedUser);
      originalUserFieldsRef.current = {
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        phone: updatedUser.phone || "",
        birthDate: updatedUser.birthDate || "",
        gender: updatedUser.gender || "",
        profession: updatedUser.profession || "",
        hobby: updatedUser.hobby || "",
        bio: updatedUser.bio || "",
      };
      setUserFieldsChanged(false);
    }
  }, [user, userFieldsChanged, updateUser]);

  const resetUserFields = useCallback(() => {
    if (!user) return;
    const original = originalUserFieldsRef.current;
    updateUser({
      firstName: original.firstName,
      lastName: original.lastName,
      phone: original.phone,
      birthDate: original.birthDate,
      gender: original.gender as any,
      profession: original.profession,
      hobby: original.hobby,
      bio: original.bio,
    });
    setUserFieldsChanged(false);
  }, [user, updateUser]);

  return {
    aboutText,
    setAboutText,
    selectedAnswers,
    setSelectedAnswers,
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    genders,
    setGenders,
    profileData,
    profileHasChanges: profileHasChanges || userFieldsChanged,
    userFieldsChanged,
    saveProfileData,
    resetToUserData,
    saveUserFields,
    resetUserFields,
    searchPrefsHasChanges,
    saveSearchPrefs,
    resetSearchPrefs,
    searchFiltersHasChanges,
    saveSearchFilters,
    resetSearchFilters,
    updateSearchFilters,
    saving,
    searchPrefsSaving,
    searchFiltersSaving,
    handleUpdate,
    preferredNeighborhoods: searchFiltersData.preferredNeighborhoods || [],
    mainPreferredNeighborhoodId: searchFiltersData.mainPreferredNeighborhoodId || "",
    includeAdjacentNeighborhoods: searchFiltersData.includeAdjacentNeighborhoods || false,
    cachedFilters: (() => {
      const userFromFullProfile = (fullProfile as any)?.user;
      const userFilters = userFromFullProfile?.filters || (user as any)?.filters;
      return userFilters || fullProfile?.filters || fullProfile?.searchFilters || null;
    })(),
  };
};
