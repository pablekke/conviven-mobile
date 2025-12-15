import { User } from "@/types/user";

export function mapUserFromApi(payload: any): User {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid user payload received from server");
  }

  // Direct mapping based on the verified backend response structure
  return {
    id: payload.id,
    email: payload.email,
    historicalEmail: payload.historicalEmail || null,
    firstName: payload.firstName,
    lastName: payload.lastName,
    birthDate: payload.birthDate,
    gender: payload.gender,
    desirabilityRating: payload.desirabilityRating,
    role: payload.role,
    status: payload.status,
    location: payload.location,
    profile: payload.profile,
    preferences: payload.preferences,
    filters: payload.filters,
    photoUrl: payload.photoUrl || null,
    secondaryPhotoUrls: payload.secondaryPhotoUrls || [],
    lastLoginAt: payload.lastLoginAt || null,
    discardedAt: payload.discardedAt || null,
  };
}
