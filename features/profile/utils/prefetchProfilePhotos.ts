import { Image } from "react-native";
import type { ProfilePhoto } from "../../../types/profilePhoto";

/**
 * Precarga todas las imágenes de las fotos del perfil
 * @param photos Lista de fotos del perfil
 * @returns Promise que se resuelve cuando todas las imágenes se han precargado (o fallado)
 */
export async function prefetchProfilePhotos(photos: ProfilePhoto[]): Promise<void> {
  if (!photos || photos.length === 0) {
    return;
  }

  const imageUrls = photos
    .map(photo => photo.url)
    .filter((url): url is string => !!url && typeof url === "string" && url.trim().length > 0);

  if (imageUrls.length === 0) {
    return;
  }

  const uniqueUrls = Array.from(new Set(imageUrls));

  const prefetchPromises = uniqueUrls.map(url =>
    Image.prefetch(url).catch(error => {
      console.debug(`[prefetchProfilePhotos] Error precargando imagen: ${url}`, error);
      return null;
    }),
  );

  await Promise.allSettled(prefetchPromises);
}
