import { useMemo } from "react";

import { createProfileCardData, ProfileCardData, ProfileCardSource } from "../utils/createProfileCardData";

export function useProfileCardData(profile: ProfileCardSource): ProfileCardData {
  return useMemo(() => createProfileCardData(profile), [profile]);
}
