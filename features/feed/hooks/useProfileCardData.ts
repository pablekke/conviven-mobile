import { useMemo } from "react";

import {
  createProfileCardData,
  type ProfileCardData,
  type ProfileLike,
} from "../utils/createProfileCardData";

export function useProfileCardData(profile: ProfileLike): ProfileCardData {
  return useMemo(() => createProfileCardData(profile), [profile]);
}

export type { ProfileCardData, ProfileLike };
