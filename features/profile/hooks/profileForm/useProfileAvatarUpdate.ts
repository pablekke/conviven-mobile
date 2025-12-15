import UserService from "../../../../services/userService";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { User } from "../../../../types/user";
import { Alert } from "react-native";

interface Params {
  user: User | null;
  setUser: (user: User) => Promise<void> | void;
}

export function useProfileAvatarUpdate({ user, setUser }: Params) {
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleAvatarUpdate = useCallback(async () => {
    if (!user) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permisos", "Necesitamos acceso a tu galería para actualizar la foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setPhotoUploading(true);

      const updatedUser = await UserService.updateAvatar(user.id, {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });

      await setUser(updatedUser);
      Alert.alert("Foto actualizada", "Tu foto de perfil se actualizó correctamente.");
    } catch (error) {
      console.error("Avatar update error", error);
      Alert.alert("Foto", "No pudimos actualizar tu foto. Intenta nuevamente.");
    } finally {
      setPhotoUploading(false);
    }
  }, [setUser, user]);

  return { photoUploading, handleAvatarUpdate };
}
