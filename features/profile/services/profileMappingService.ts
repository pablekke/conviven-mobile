import { PetType } from "../enums/searchPreferences.enums";
import { UserProfile } from "../../../types/user";
import { UserProfileData } from "../interfaces";

class ProfileMappingService {

  private mapPets(petsOwned?: string[]): string {
    if (!petsOwned || petsOwned.length === 0) return "none";

    const hasDog = petsOwned.includes(PetType.DOG) || petsOwned.includes("dog");
    const hasCat = petsOwned.includes(PetType.CAT) || petsOwned.includes("cat");
    const hasOther = petsOwned.includes(PetType.OTHER) || petsOwned.includes("other");

    if (hasDog) return PetType.DOG;
    if (hasCat) return PetType.CAT;
    if (hasOther) return PetType.OTHER;
    if (petsOwned.length > 0) return petsOwned[0];

    return "none";
  }

  mapUserProfileToFormData(userData: any): UserProfileData {
    const profile: UserProfile | undefined = userData?.profile;

    return {
      bio: profile?.bio ?? "",
      smokingStatus: profile?.smokesCigarettes || "",
      marijuanaStatus: profile?.smokesWeed || "",
      alcoholStatus: profile?.alcohol || "",
      hasPets: this.mapPets(profile?.petsOwned),
      petsOwned: profile?.petsOwned || [],
      acceptsPets: profile?.petsOk || "",
      tidinessLevel: profile?.tidiness || "",
      socialLife: profile?.guestsFreq || "",
      sleepTime: profile?.schedule || "",
      cooking: profile?.cooking || "",
      diet: profile?.diet || "",
      sharePolicy: profile?.sharePolicy || "",
      interests: profile?.interests || [],
      zodiacSign: profile?.zodiacSign || "",
    };
  }
}

export default new ProfileMappingService();
