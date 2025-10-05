import { Gender, User, UserRole, UserStatus, VerificationStatus } from "@/types/user";

const normalizeString = (value: any): string | undefined => {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  return undefined;
};

const parseEnumValue = <T extends string>(values: readonly T[], value: any): T | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const upperValue = value.toUpperCase() as T;
  return values.includes(upperValue) ? upperValue : undefined;
};

const parseGender = (value: any): Gender | undefined =>
  parseEnumValue<Gender>(Object.values(Gender) as Gender[], value);

const parseUserRole = (value: any): UserRole | undefined =>
  parseEnumValue<UserRole>(Object.values(UserRole) as UserRole[], value);

const parseUserStatus = (value: any): UserStatus | undefined =>
  parseEnumValue<UserStatus>(Object.values(UserStatus) as UserStatus[], value);

const mapVerificationStatus = (data: any): VerificationStatus | undefined => {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const emailVerified = Boolean(
    data.emailVerified ?? data.email_verified ?? data.isEmailVerified ?? data.email
  );

  const identityVerified = Boolean(
    data.identityVerified ?? data.identity_verified ?? data.isIdentityVerified
  );

  const phoneVerified = Boolean(
    data.phoneVerified ?? data.phone_verified ?? data.isPhoneVerified ?? data.phone
  );

  const references =
    typeof data.references === "number"
      ? data.references
      : typeof data.referencesCount === "number"
        ? data.referencesCount
        : Array.isArray(data.references)
          ? data.references.length
          : 0;

  const reliabilityLevel = normalizeString(
    data.reliabilityLevel ?? data.reliability_level ?? data.level ?? data.badgeLabel,
  );

  return {
    email: emailVerified,
    identity: identityVerified,
    phone: phoneVerified,
    references,
    reliabilityLevel,
  };
};

export function mapUserFromApi(payload: any): User {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid user payload received from server");
  }

  const firstName =
    normalizeString(payload.firstName) ??
    normalizeString(payload.firstname) ??
    normalizeString(payload.profile?.firstName) ??
    normalizeString(payload.name?.split?.(" ")?.[0]) ??
    undefined;

  const lastName =
    normalizeString(payload.lastName) ??
    normalizeString(payload.lastname) ??
    normalizeString(payload.profile?.lastName) ??
    undefined;

  const department = payload.department ?? payload.departmentInfo ?? {};
  const neighborhood = payload.neighborhood ?? payload.neighborhoodInfo ?? {};

  const composedName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const rawName = normalizeString(payload.name);

  const name =
    rawName ??
    (composedName.length > 0 ? composedName : undefined) ??
    normalizeString(payload.username) ??
    normalizeString(payload.displayName) ??
    payload.email ??
    "Usuario";

  const reliabilityScoreRaw =
    payload.reliabilityScore ??
    payload.reliability_score ??
    payload.metrics?.reliabilityScore ??
    payload.metrics?.reliability_score;

  const searchStatusRaw =
    payload.searchStatus ??
    payload.search_status ??
    payload.matchingStatus ??
    payload.matching_status ??
    payload.roommateSearchStatus ??
    payload.roommate_search_status;

  const verificationStatus =
    mapVerificationStatus(payload.verification ?? payload.verifications ?? payload.badges) ??
    mapVerificationStatus(payload);

  return {
    id: payload.id ?? payload._id ?? payload.uuid ?? "",
    email: payload.email ?? "",
    name,
    firstName,
    lastName,
    avatar:
      normalizeString(payload.photoUrl) ??
      normalizeString(payload.photoURL) ??
      normalizeString(payload.avatar) ??
      (Array.isArray(payload.secondaryPhotoUrls) ? payload.secondaryPhotoUrls[0] : undefined) ??
      normalizeString(payload.profilePicture) ??
      normalizeString(payload.picture),
    bio:
      normalizeString(payload.bio) ??
      normalizeString(payload.aboutMe) ??
      normalizeString(payload.description),
    location:
      normalizeString(payload.location) ??
      normalizeString(payload.address?.name) ??
      normalizeString(payload.referenceLocation) ??
      undefined,
    phone: normalizeString(payload.phone) ?? normalizeString(payload.phoneNumber),
    birthDate: normalizeString(payload.birthDate) ?? normalizeString(payload.birthdate),
    gender: parseGender(payload.gender),
    departmentId: department.id ?? payload.departmentId ?? normalizeString(payload.department_id),
    departmentName:
      normalizeString(department.name) ?? normalizeString(payload.departmentName),
    neighborhoodId:
      neighborhood.id ??
      payload.neighborhoodId ??
      normalizeString(payload.neighborhood_id),
    neighborhoodName:
      normalizeString(neighborhood.name) ?? normalizeString(payload.neighborhoodName),
    role: parseUserRole(payload.role) ?? parseUserRole(payload.userRole),
    status: parseUserStatus(payload.status) ?? parseUserStatus(payload.userStatus),
    searchPreferencesId:
      normalizeString(payload.searchPreferencesId) ??
      normalizeString(payload.search_preferences_id) ??
      normalizeString(payload.preferences?.id),
    reliabilityScore:
      typeof reliabilityScoreRaw === "number"
        ? reliabilityScoreRaw
        : reliabilityScoreRaw
          ? Number(reliabilityScoreRaw)
          : undefined,
    verificationStatus,
    searchStatus: normalizeString(searchStatusRaw),
    lastLoginAt:
      normalizeString(payload.lastLoginAt) ??
      normalizeString(payload.lastLogin) ??
      normalizeString(payload.last_login_at),
    roommatePreferences:
      payload.roommatePreferences ?? payload.preferences?.roommate ?? undefined,
  };
}
