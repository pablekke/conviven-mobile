import { mapBackendToProfileLike, type MockedBackendUser } from "../mocks/incomingProfile";
import {
  mapBackendFiltersToUi,
  mapBackendLocationToUi,
  mapBackendProfileToUiProfile,
} from "../mocks/incomingProfile";
import { toProfileCardSnapshot } from "./profileCardData";

type PrimaryCardData = {
  photos: readonly string[];
  locationStrings: readonly string[];
  headline: string;
  budget: string;
  basicInfo: readonly string[];
  longestLocation: string;
  mainPhoto: string;
};

type UserInfoData = {
  profile: ReturnType<typeof mapBackendProfileToUiProfile>;
  location: ReturnType<typeof mapBackendLocationToUi>;
  filters: ReturnType<typeof mapBackendFiltersToUi>;
  budgetFull: string;
};

export type ProfileDeckItem = {
  id: string;
  primary: PrimaryCardData;
  userInfo: UserInfoData;
};

export function createProfileCardData(profile: MockedBackendUser): ProfileDeckItem {
  const like = mapBackendToProfileLike(profile);
  const snapshot = toProfileCardSnapshot(like);

  return {
    id: profile.profile.id,
    primary: {
      photos: snapshot.galleryPhotos,
      locationStrings: snapshot.locationStrings,
      headline: snapshot.headline,
      budget: snapshot.budgetLabel,
      basicInfo: snapshot.basicInfo,
      longestLocation: snapshot.longestLocation,
      mainPhoto: snapshot.mainPhoto,
    },
    userInfo: {
      profile: mapBackendProfileToUiProfile(profile.profile),
      location: mapBackendLocationToUi(profile.location),
      filters: mapBackendFiltersToUi(profile.filters),
      budgetFull: snapshot.budgetLabel,
    },
  };
}

export function createProfileDeckData(
  profiles: readonly MockedBackendUser[],
): ProfileDeckItem[] {
  return profiles.map(createProfileCardData);
}
