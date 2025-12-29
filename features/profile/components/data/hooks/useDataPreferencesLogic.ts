import userProfileUpdateService from "../../../services/userProfileUpdateService";
import LocationService from "../../../../../services/locationService";
import { useCallback, useEffect, useState, useRef } from "react";
import ProfileService from "../../../services/profileService";
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

  handleLocationConfirm: (selectedIds: string[], mainNeighborhoodId?: string | null) => void;

  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;

  getLocationLabel: () => string;
  calculateAge: () => number | null;

  saveDataPrefs: () => Promise<void>;
  resetDataPrefs: () => void;
}

export const useDataPreferencesLogic = (): UseDataPreferencesLogicReturn => {
  const { user, updateUser } = useAuth();

  const normalizeBirthDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  const originalDataRef = useRef<{
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
  }>({
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

  // Draft de ubicación (solo se guarda cuando se presiona "guardar")
  const [draftLocation, setDraftLocation] = useState<{
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null>(null);

  // Draft de género (solo se guarda cuando se presiona "guardar")
  const [draftGender, setDraftGender] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const normalizedBirthDate = normalizeBirthDate(user.birthDate);
      setFirstNameState(user.firstName || "");
      setLastNameState(user.lastName || "");
      setBioState(user.profile?.bio || "");
      setOccupationState(user.profile?.occupation || "");
      setEducationState(user.profile?.education || "");
      setDraftLocation(null); // Resetear draft cuando cambia el usuario
      setDraftGender(null); // Resetear draft de género cuando cambia el usuario
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

  // Normalizar valores para comparación (evitar falsos positivos por null vs undefined vs "")
  const normalizeValue = (val: string | null | undefined): string => {
    return (val || "").trim();
  };

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
      updateUser({
        profile: {
          ...(user?.profile as any),
          bio: value,
        },
      });
    },
    [updateUser, user?.profile],
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
    [updateUser, user?.profile],
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
    [updateUser, user?.profile],
  );

  const setBirthDate = useCallback(
    (value: string) => {
      updateUser({ birthDate: value });
    },
    [updateUser],
  );

  const setGender = useCallback(
    (value: string) => {
      // Solo guardar en draft, NO hacer llamadas API
      setDraftGender(value);
      // Actualizar UI localmente sin hacer llamadas API
      updateUser({ gender: value as any });
    },
    [updateUser],
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

  const getLocationLabel = useCallback(() => {
    // Si hay draft, mostrarlo (nombre desde cache)
    if (draftLocation?.neighborhoodId) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        getCachedNeighborhood,
      } = require("../../filters/neighborhoods/services/neighborhoodsService");
      const n = getCachedNeighborhood(draftLocation.neighborhoodId);
      if (n?.name) return n.name;
    }

    const loc = user?.location;
    if (loc?.neighborhood?.name) return loc.neighborhood.name;
    if (loc?.city?.name) return loc.city.name;
    if (loc?.department?.name) return loc.department.name;

    return "Seleccionar";
  }, [user, draftLocation]);

  const handleLocationConfirm = useCallback(
    (selectedIds: string[], mainNeighborhoodId?: string | null) => {
      if (!user || !mainNeighborhoodId) return;

      // Solo guardar en draft, NO hacer llamadas API
      const {
        getCachedNeighborhood,
      } = require("../../filters/neighborhoods/services/neighborhoodsService");
      const neighborhood = getCachedNeighborhood(mainNeighborhoodId);

      let cityId: string | null = null;
      let departmentId: string | null = null;

      // Intentar obtener datos del cache
      if (neighborhood) {
        cityId = neighborhood.cityId || null;
        departmentId = neighborhood.departmentId || null;
      }

      // Si faltan datos del cache, intentar desde user.location
      if (!cityId && user.location?.city?.id) {
        cityId = user.location.city.id;
      }
      if (!departmentId && user.location?.department?.id) {
        departmentId = user.location.department.id;
      }

      // Guardar en draft (se enviará cuando se presione "guardar")
      setDraftLocation({
        neighborhoodId: mainNeighborhoodId,
        cityId,
        departmentId,
      });
    },
    [user],
  );

  const saveDataPrefs = useCallback(async () => {
    if (!user || !dataHasChanges) return Promise.resolve();

    setDataSaving(true);
    try {
      const payload: any = {};
      let locationPatchUser: {
        departmentId: string | null;
        cityId: string | null;
        neighborhoodId: string | null;
      } | null = null;
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
      // Incluir cambios de género si hay draft
      const currentGender = draftGender !== null ? draftGender : user.gender;
      if ((currentGender || "") !== (original.gender || "")) {
        payload.gender = currentGender;
      }

      // Incluir cambios de ubicación solo si cambió realmente
      if (draftLocation && draftLocation.neighborhoodId !== original.neighborhoodId) {
        // Solo hacer llamadas API si faltan datos necesarios
        let cityId = draftLocation.cityId;
        let departmentId = draftLocation.departmentId;

        if (!cityId || !departmentId) {
          // Obtener datos faltantes del neighborhood
          const neighborhood = await LocationService.getNeighborhood(draftLocation.neighborhoodId!);
          cityId = neighborhood.cityId || null;
          departmentId = neighborhood.departmentId || null;

          if (!cityId) {
            console.error("No cityId found for neighborhood", neighborhood);
            setDataSaving(false);
            return;
          }

          if (!departmentId) {
            const city = await LocationService.getCity(cityId);
            departmentId = city.departmentId;
          }

          if (!departmentId) {
            const department = await LocationService.getDepartment(departmentId!);
            departmentId = department.id;
          }
        }

        locationPatchUser = {
          departmentId: departmentId || null,
          cityId: cityId || null,
          neighborhoodId: draftLocation.neighborhoodId || null,
        };
      }

      const profilePayload: any = {};
      if ((occupation || "") !== (original.occupation || "")) {
        profilePayload.occupation = occupation;
      }
      if ((education || "") !== (original.education || "")) {
        profilePayload.education = education;
      }
      if ((bio || "") !== (original.bio || "")) {
        profilePayload.bio = bio;
      }

      let finalUpdatedUser = user;

      if (Object.keys(profilePayload).length > 0) {
        finalUpdatedUser = await userProfileUpdateService.updateUserProfile(profilePayload);
        updateUser(finalUpdatedUser);
      }

      // 1) Ubicación (PATCH /profiles/me con { user: { ... } })
      if (locationPatchUser) {
        finalUpdatedUser = await ProfileService.updateMe({ user: locationPatchUser });
        updateUser(finalUpdatedUser);
      }

      // 2) Otros campos del usuario (PUT /users/{id})
      if (Object.keys(payload).length > 0) {
        finalUpdatedUser = await ProfileService.update(user.id, payload);
        updateUser(finalUpdatedUser);
      }

      if (Object.keys(profilePayload).length > 0 || Object.keys(payload).length > 0) {
        originalDataRef.current = {
          firstName: finalUpdatedUser.firstName || "",
          lastName: finalUpdatedUser.lastName || "",
          birthDate: normalizeBirthDate(finalUpdatedUser.birthDate) || "",
          gender: finalUpdatedUser.gender || "",
          occupation: finalUpdatedUser.profile?.occupation || "",
          education: finalUpdatedUser.profile?.education || "",
          bio: finalUpdatedUser.profile?.bio || "",
          neighborhoodId: finalUpdatedUser.location?.neighborhood?.id || null,
          cityId: finalUpdatedUser.location?.city?.id || null,
          departmentId: finalUpdatedUser.location?.department?.id || null,
        };
        // Limpiar drafts después de guardar
        setDraftLocation(null);
        setDraftGender(null);
      }
    } catch (error) {
      console.error("Error saving data preferences:", error);
      throw error;
    } finally {
      setDataSaving(false);
    }
  }, [
    user,
    firstName,
    lastName,
    occupation,
    education,
    bio,
    dataHasChanges,
    draftLocation,
    draftGender,
    updateUser,
  ]);

  const resetDataPrefs = useCallback(() => {
    if (!user) return;
    const original = originalDataRef.current;
    setFirstNameState(original.firstName);
    setLastNameState(original.lastName);
    setOccupationState(original.occupation);
    setEducationState(original.education);
    setBioState(original.bio);
    updateUser({
      firstName: original.firstName,
      lastName: original.lastName,
      birthDate: original.birthDate,
      gender: original.gender as any,
      profile: {
        ...(user.profile as any),
        occupation: original.occupation,
        education: original.education,
        bio: original.bio,
      },
    });
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
    draftLocation,
    getLocationLabel,
    calculateAge,
    saveDataPrefs,
    resetDataPrefs,
  };
};
