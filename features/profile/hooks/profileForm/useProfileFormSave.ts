import userProfileUpdateService from "../../services/userProfileUpdateService";
import { User, UpdateUserPayload } from "../../../../types/user";
import UserService from "../../../../services/userService";
import { useCallback, useState } from "react";
import { EditForm } from "../../types";
import { Alert } from "react-native";

interface Params {
  user: User | null;
  form: EditForm;
  setUser: (user: User) => Promise<void> | void;
  setEditVisible: (visible: boolean) => void;
}

export function useProfileFormSave({ user, form, setUser, setEditVisible }: Params) {
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;

    setSavingProfile(true);

    const payload: UpdateUserPayload = {
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      departmentId: form.departmentId || undefined,
      cityId: form.cityId || undefined,
      neighborhoodId: form.neighborhoodId || undefined,
    };

    try {
      const updatedUser = await UserService.update(user.id, payload);

      const nextBio = form.bio.trim();
      const shouldUpdateBio = nextBio.length > 0 && nextBio !== (user.profile?.bio ?? "");

      const finalUser = shouldUpdateBio
        ? await userProfileUpdateService.updateUserProfile({ bio: nextBio })
        : updatedUser;

      await setUser(finalUser);
      setEditVisible(false);
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    } catch (error) {
      console.error("Update profile error", error);
      Alert.alert("Perfil", "No pudimos guardar los cambios. Intenta nuevamente.");
    } finally {
      setSavingProfile(false);
    }
  }, [
    form.bio,
    form.cityId,
    form.departmentId,
    form.firstName,
    form.lastName,
    form.neighborhoodId,
    setEditVisible,
    setUser,
    user,
  ]);

  return { savingProfile, handleSaveProfile };
}
