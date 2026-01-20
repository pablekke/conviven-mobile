import { resilientRequest } from "./apiClient";
import { HttpMethod } from "@/core/enums/http.enums";
import { API } from "@/constants/api";
import { ProfilePhoto, UploadPhotoResponse } from "@/types/profilePhoto";

class ProfilePhotoService {
  /**
   * Obtener todas las fotos del usuario autenticado
   * GET /api/profile-photo/
   */
  async getAll(): Promise<ProfilePhoto[]> {
    return resilientRequest<ProfilePhoto[]>({
      endpoint: API.PROFILE_PHOTOS,
      method: HttpMethod.GET,
      useCache: true,
    });
  }

  /**
   * Subir foto principal
   * POST /api/profile-photo/upload/primary
   */
  async uploadPrimary(
    photo: { uri: string; name?: string; type?: string },
    isPrimary: boolean = true,
  ): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append("photo", {
      uri: photo.uri,
      name: photo.name ?? `photo-${Date.now()}.jpg`,
      type: photo.type ?? "image/jpeg",
    } as any);

    if (isPrimary) {
      formData.append("isPrimary", "true");
    }

    return resilientRequest<UploadPhotoResponse>({
      endpoint: API.PROFILE_PHOTO_UPLOAD_PRIMARY,
      method: HttpMethod.POST,
      body: formData,
      headers: {
        Accept: "application/json",
      },
      allowQueue: false,
    });
  }

  /**
   * Subir foto adicional
   * POST /api/profile-photo/upload/additional
   */
  async uploadAdditional(photo: {
    uri: string;
    name?: string;
    type?: string;
  }): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append("photo", {
      uri: photo.uri,
      name: photo.name ?? `photo-${Date.now()}.jpg`,
      type: photo.type ?? "image/jpeg",
    } as any);

    return resilientRequest<UploadPhotoResponse>({
      endpoint: API.PROFILE_PHOTO_UPLOAD_ADDITIONAL,
      method: HttpMethod.POST,
      body: formData,
      headers: {
        Accept: "application/json",
      },
      allowQueue: false,
    });
  }

  /**
   * Establecer una foto como principal
   * POST /api/profile-photo/:id/primary
   */
  async setPrimary(id: string): Promise<void> {
    return resilientRequest<void>({
      endpoint: API.PROFILE_PHOTO_SET_PRIMARY(id),
      method: HttpMethod.POST,
      allowQueue: true,
    });
  }

  /**
   * Eliminar una foto
   * DELETE /api/profile-photo/:id
   */
  async delete(id: string): Promise<void> {
    return resilientRequest<void>({
      endpoint: API.PROFILE_PHOTO_BY_ID(id),
      method: HttpMethod.DELETE,
      allowQueue: true,
    });
  }

  /**
   * Reordenar fotos
   * PUT /api/profile-photos/reorder
   */
  async reorderPhotos(photos: { photoId: string; order: number }[]): Promise<void> {
    return resilientRequest<void>({
      endpoint: "/profile-photos/reorder",
      method: HttpMethod.PUT,
      body: { photos },
      allowQueue: false,
    });
  }
}

export default new ProfilePhotoService();
