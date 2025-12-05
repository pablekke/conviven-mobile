import { Image } from "react-native";
import type { MockedBackendUser } from "../mocks/incomingProfile";

function extractImageUrls(profile: MockedBackendUser): string[] {
  const urls: string[] = [];

  if (profile.photoUrl) {
    urls.push(profile.photoUrl);
  }

  if (Array.isArray(profile.secondaryPhotoUrls)) {
    profile.secondaryPhotoUrls.forEach(url => {
      if (url && typeof url === "string" && url.trim().length > 0) {
        urls.push(url);
      }
    });
  }

  return urls;
}

/**
 * Precarga todas las imágenes de una lista de perfiles
 * @param profiles Lista de perfiles de roomies
 * @returns Promise que se resuelve cuando todas las imágenes se han precargado (o fallado)
 */
export async function prefetchRoomiesImages(profiles: MockedBackendUser[]): Promise<void> {
  if (!profiles || profiles.length === 0) {
    return;
  }
 
  const imageUrls: string[] = [];
  profiles.forEach(profile => {
    const urls = extractImageUrls(profile);
    imageUrls.push(...urls);
  });

  const uniqueUrls = Array.from(new Set(imageUrls));

  if (uniqueUrls.length === 0) {
    return;
  }

  const prefetchPromises = uniqueUrls.map(url =>
    Image.prefetch(url).catch(() => {
      return null;
    }),
  );

  await Promise.allSettled(prefetchPromises);
}
