import userProfileUpdateService from "../../../services/userProfileUpdateService";
import LocationService from "../../../../../services/locationService";
import ProfileService from "../../../services/profileService";
import { useAuth } from "../../../../../context/AuthContext";
import type { OriginalDataRef } from "./useDataState";
import { useCallback } from "react";

export const useDataSave = (
  getChanges: () => any,
  dataHasChanges: boolean,
  setDataSaving: (saving: boolean) => void,
  setDraftLocation: (location: any) => void,
  setDraftGender: (gender: string | null) => void,
  originalDataRef: React.MutableRefObject<OriginalDataRef>,
  normalizeBirthDate: (dateString: string | null | undefined) => string,
) => {
  const { user, updateUser } = useAuth();

  const saveDataPrefs = useCallback(async () => {
    if (!user || !dataHasChanges) return Promise.resolve();

    const changes = getChanges();
    if (Object.keys(changes).length === 0) return Promise.resolve();

    setDataSaving(true);
    try {
      const payload: any = {};
      const profilePayload: any = {};
      let locationPatchUser: any = null;

      if (changes.firstName !== undefined) payload.firstName = changes.firstName.trim();
      if (changes.lastName !== undefined) payload.lastName = changes.lastName.trimEnd();
      if (changes.birthDate !== undefined) payload.birthDate = changes.birthDate;
      if (changes.gender !== undefined) payload.gender = changes.gender;

      if (changes.occupation !== undefined) profilePayload.occupation = changes.occupation;
      if (changes.education !== undefined) profilePayload.education = changes.education;
      if (changes.bio !== undefined) profilePayload.bio = changes.bio;

      if (changes.location) {
        let cityId = changes.location.cityId;
        let departmentId = changes.location.departmentId;

        if (!cityId || !departmentId) {
          const neighborhood = await LocationService.getNeighborhood(
            changes.location.neighborhoodId!,
          );
          cityId = neighborhood.cityId || null;
          departmentId = neighborhood.departmentId || null;

          if (!cityId) {
            console.error("No cityId found for neighborhood", neighborhood);
          } else if (!departmentId) {
            const city = await LocationService.getCity(cityId);
            departmentId = city.departmentId;
            if (!departmentId) {
              const department = await LocationService.getDepartment(departmentId!);
              departmentId = department.id;
            }
          }
        }

        if (cityId && departmentId) {
          locationPatchUser = {
            departmentId,
            cityId,
            neighborhoodId: changes.location.neighborhoodId,
          };
        }
      }

      let finalUpdatedUser = user;

      if (Object.keys(profilePayload).length > 0) {
        finalUpdatedUser = await userProfileUpdateService.updateUserProfile(profilePayload);
        updateUser(finalUpdatedUser);
      }

      if (locationPatchUser) {
        finalUpdatedUser = await ProfileService.updateMe({ user: locationPatchUser });
        updateUser(finalUpdatedUser);
      }

      if (Object.keys(payload).length > 0) {
        finalUpdatedUser = await ProfileService.update(user.id, payload);
        updateUser(finalUpdatedUser);
      }

      if (
        Object.keys(profilePayload).length > 0 ||
        Object.keys(payload).length > 0 ||
        locationPatchUser
      ) {
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
    dataHasChanges,
    getChanges,
    updateUser,
    setDataSaving,
    setDraftLocation,
    setDraftGender,
    originalDataRef,
    normalizeBirthDate,
  ]);

  const resetDataPrefs = useCallback(() => {
    if (!user) return;
    const original = originalDataRef.current;
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
  }, [user, updateUser, originalDataRef]);

  return {
    saveDataPrefs,
    resetDataPrefs,
  };
};
