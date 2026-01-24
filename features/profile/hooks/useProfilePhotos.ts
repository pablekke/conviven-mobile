import ProfilePhotoService from "../../../services/profilePhotoService";
import { prefetchProfilePhotos } from "../utils/prefetchProfilePhotos";
import { getCachedValue } from "../../../services/resilience/cache";
import * as ImageManipulator from "expo-image-manipulator";
import { ProfilePhoto } from "../../../types/profilePhoto";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { API } from "../../../constants/api";
import { Alert } from "react-native";

export interface UseProfilePhotosReturn {
  photos: ProfilePhoto[];
  primaryPhoto: ProfilePhoto | null;
  additionalPhotos: ProfilePhoto[];
  loading: boolean;
  uploadingPhotoType: string | null;
  refreshing: boolean;
  deletingPhotoId: string | null;
  initialized: boolean;
  loadPhotos: () => Promise<void>;
  uploadPrimaryPhoto: () => Promise<void>;
  uploadAdditionalPhoto: () => Promise<void>;
  editPhoto: (photoId: string, isPrimary: boolean) => Promise<void>;
  setAsPrimary: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  refreshPhotos: (showIndicator?: boolean) => Promise<ProfilePhoto[]>;
  reorderPhotos: (reorderedPhotos: ProfilePhoto[]) => Promise<void>;
}

export const useProfilePhotos = (): UseProfilePhotosReturn => {
  const { user, updateUser, refreshUser } = useAuth();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotoType, setUploadingPhotoType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const primaryPhoto = photos.find(photo => photo.isPrimary) || null;
  const additionalPhotos = photos.filter(photo => !photo.isPrimary);

  const loadPhotos = useCallback(async (forceRefresh: boolean = false) => {
    try {
      if (!forceRefresh) {
        const cachedPhotos = await getCachedValue<ProfilePhoto[]>(API.PROFILE_PHOTOS);
        if (cachedPhotos && Array.isArray(cachedPhotos)) {
          setPhotos(cachedPhotos);
          setInitialized(true);

          prefetchProfilePhotos(cachedPhotos).catch(error => {
            console.debug("[useProfilePhotos] Error precargando imágenes del cache:", error);
          });

          return;
        }
      }
      setLoading(true);
      const fetchedPhotos = await ProfilePhotoService.getAll();
      const photosArray = Array.isArray(fetchedPhotos) ? fetchedPhotos : [];
      setPhotos(photosArray);
      setInitialized(true);

      if (photosArray.length > 0) {
        prefetchProfilePhotos(photosArray).catch(error => {
          console.debug("[useProfilePhotos] Error precargando imágenes:", error);
        });
      }
    } catch (error: any) {
      console.error("Error loading photos:", error);
      setPhotos([]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPhotos = useCallback(async (showIndicator: boolean = true) => {
    try {
      if (showIndicator) setRefreshing(true);
      const fetchedPhotos = await ProfilePhotoService.getAll();
      const photosArray = Array.isArray(fetchedPhotos) ? fetchedPhotos : [];
      setPhotos(photosArray);

      if (photosArray.length > 0) {
        prefetchProfilePhotos(photosArray).catch(error => {
          console.debug("[useProfilePhotos] Error precargando imágenes al refrescar:", error);
        });
      }
      return photosArray;
    } catch (error) {
      console.error("Error refreshing photos:", error);
      return [];
    } finally {
      setRefreshing(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permisos necesarios",
        "Necesitamos acceso a tu galería para subir fotos de perfil.",
      );
      return false;
    }
    return true;
  }, []);

  const uploadPrimaryPhoto = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0] as any;
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Toast.show({
          type: "error",
          text1: "La imagen es demasiado pesada (máx 5MB).",
        });
        return;
      }

      setUploadingPhotoType("primary");

      const uploadedPhoto = await ProfilePhotoService.uploadPrimary({
        uri: asset.uri,
        name: asset.fileName || "primary_photo.jpg",
        type: asset.mimeType || "image/jpeg",
      });

      await refreshPhotos(false);

      // Actualizar el avatar del usuario en el contexto
      if (user && uploadedPhoto?.url) {
        await updateUser({ photoUrl: uploadedPhoto.url });
        await refreshUser();
      }

      Toast.show({
        type: "success",
        text1: "Tu foto principal se subió correctamente.",
      });
    } catch (error: any) {
      console.error("Error uploading primary photo:", error);
      Toast.show({
        type: "error",
        text1: error?.message || "No se pudo subir la foto. Intenta nuevamente.",
      });
    } finally {
      setUploadingPhotoType(null);
    }
  }, [requestPermissions, refreshPhotos, user, updateUser, refreshUser]);

  const uploadAdditionalPhoto = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Validar que no se exceda el límite de 4 fotos adicionales
    if (additionalPhotos.length >= 4) {
      Toast.show({
        type: "error",
        text1: "Has alcanzado el límite máximo de 4 fotos adicionales.",
      });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const uploadId = `additional-${Date.now()}`;
      setUploadingPhotoType(uploadId);

      await ProfilePhotoService.uploadAdditional({
        uri: asset.uri,
        name: asset.fileName,
        type: asset.mimeType,
      });

      await refreshPhotos(false);
      Toast.show({
        type: "success",
        text1: "La foto se agregó correctamente.",
      });
    } catch (error: any) {
      console.error("Error uploading additional photo:", error);
      Toast.show({
        type: "error",
        text1: error?.message || "No se pudo subir la foto. Intenta nuevamente.",
      });
    } finally {
      setUploadingPhotoType(null);
    }
  }, [requestPermissions, refreshPhotos, additionalPhotos.length]);

  const setAsPrimary = useCallback(
    async (photoId: string) => {
      try {
        await ProfilePhotoService.setPrimary(photoId);
        const updatedPhotos = await refreshPhotos(false);

        const newPrimaryPhoto = updatedPhotos.find(p => p.id === photoId);
        if (user && newPrimaryPhoto?.url) {
          await updateUser({ photoUrl: newPrimaryPhoto.url });
          await refreshUser();
        }

        Toast.show({
          type: "success",
          text1: "Foto principal actualizada.",
        });
      } catch (error: any) {
        console.error("Error setting primary photo:", error);
        Toast.show({
          type: "error",
          text1: error?.message || "No se pudo actualizar la foto principal.",
        });
      }
    },
    [refreshPhotos, user, updateUser, refreshUser],
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      const photoToDelete = photos.find(p => p.id === photoId);
      const isPrimary = photoToDelete?.isPrimary;

      Alert.alert(
        "Eliminar foto",
        isPrimary
          ? "Esta es tu foto principal. ¿Estás seguro de que quieres eliminarla?"
          : "¿Estás seguro de que quieres eliminar esta foto?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingPhotoId(photoId);
                await ProfilePhotoService.delete(photoId);
                const updatedPhotos = await ProfilePhotoService.getAll();
                if (isPrimary && updatedPhotos.length > 0) {
                  const nextPrimary = updatedPhotos.find(p => !p.isPrimary) || updatedPhotos[0];
                  if (nextPrimary) {
                    await ProfilePhotoService.setPrimary(nextPrimary.id);
                    // Actualizar el avatar del usuario con la nueva foto principal
                    if (user && nextPrimary.url) {
                      await updateUser({ photoUrl: nextPrimary.url });
                      await refreshUser();
                    }
                  }
                  await refreshPhotos(false);
                } else {
                  await refreshPhotos(false);
                }

                Toast.show({
                  type: "success",
                  text1:
                    isPrimary && updatedPhotos.length > 0
                      ? "La foto se eliminó y se seleccionó otra como principal."
                      : "La foto se eliminó correctamente.",
                });
              } catch (error: any) {
                console.error("Error deleting photo:", error);
                Toast.show({
                  type: "error",
                  text1: error?.message || "No se pudo eliminar la foto. Intenta nuevamente.",
                });
              } finally {
                setDeletingPhotoId(null);
              }
            },
          },
        ],
      );
    },
    [photos, refreshPhotos, user, updateUser, refreshUser],
  );

  const reorderPhotos = useCallback(
    async (reorderedPhotos: ProfilePhoto[]) => {
      const previousPhotos = [...photos];

      try {
        // Optimistic update
        setPhotos(reorderedPhotos);

        // Send to backend
        const photosToReorder = reorderedPhotos.map((photo, index) => ({
          photoId: photo.id,
          order: index,
        }));

        await ProfilePhotoService.reorderPhotos(photosToReorder);

        // Refresh to ensure consistency
        await refreshPhotos(false);
      } catch (error: any) {
        console.error("Error reordering photos:", error);
        // Rollback on error
        setPhotos(previousPhotos);
        Toast.show({
          type: "error",
          text1: error?.message || "No se pudo reordenar las fotos. Intenta nuevamente.",
        });
      }
    },
    [photos, refreshPhotos],
  );

  const editPhoto = useCallback(
    async (photoId: string, isPrimary: boolean) => {
      try {
        const photoToEdit = photos.find(p => p.id === photoId);
        if (!photoToEdit) {
          Toast.show({
            type: "error",
            text1: "No se encontró la foto.",
          });
          return;
        }

        const result = await ImageManipulator.manipulateAsync(photoToEdit.url, [], {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        });

        if (!result.uri) {
          return;
        }

        setUploadingPhotoType(isPrimary ? "primary" : `additional-${photoId}`);

        await ProfilePhotoService.delete(photoId);

        const fileName = `photo-${Date.now()}.jpg`;

        if (isPrimary) {
          const uploadedPhoto = await ProfilePhotoService.uploadPrimary({
            uri: result.uri,
            name: fileName,
            type: "image/jpeg",
          });

          await refreshPhotos(false);

          if (user && uploadedPhoto?.url) {
            await updateUser({ photoUrl: uploadedPhoto.url });
            await refreshUser();
          }
        } else {
          await ProfilePhotoService.uploadAdditional({
            uri: result.uri,
            name: fileName,
            type: "image/jpeg",
          });

          await refreshPhotos(false);
        }

        Toast.show({
          type: "success",
          text1: "La foto se actualizó correctamente.",
        });
      } catch (error: any) {
        console.error("Error editing photo:", error);
        Toast.show({
          type: "error",
          text1: error?.message || "No se pudo actualizar la foto. Intenta nuevamente.",
        });
      } finally {
        setUploadingPhotoType(null);
      }
    },
    [photos, refreshPhotos, user, updateUser, refreshUser],
  );

  useEffect(() => {
    if (!initialized) {
      loadPhotos(false);
    }
  }, [initialized, loadPhotos]);

  return {
    photos,
    primaryPhoto,
    additionalPhotos,
    loading,
    uploadingPhotoType,
    refreshing,
    deletingPhotoId,
    initialized,
    loadPhotos,
    uploadPrimaryPhoto,
    uploadAdditionalPhoto,
    editPhoto,
    setAsPrimary,
    deletePhoto,
    refreshPhotos,
    reorderPhotos,
  };
};
