import type { ProfileCardSnapshot, ProfileLike } from "../utils/profileCardData";
import { useProfileCardSnapshot } from "../utils/profileCardData";

export function useProfileCardData(profile: ProfileLike): ProfileCardSnapshot {
  return useProfileCardSnapshot(profile);
}
