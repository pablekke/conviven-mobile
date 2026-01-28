import { Schedule } from "../enums/searchPreferences.enums";
import { apiPut } from "../../../services/apiHelper";
import { UserProfileData } from "../interfaces";
import { User } from "../../../types/user";

class UserProfileUpdateService {
  private mapFormDataToApiData(formData: Partial<UserProfileData>): any {
    const apiData: any = {};

    if (formData.bio !== undefined && formData.bio !== "") {
      apiData.bio = formData.bio;
    }

    if (formData.smokingStatus) {
      apiData.smokesCigarettes = formData.smokingStatus.toUpperCase();
    } else if (formData.smokesCigarettes) {
      apiData.smokesCigarettes = formData.smokesCigarettes;
    }

    if (formData.marijuanaStatus) {
      apiData.smokesWeed =
        formData.marijuanaStatus === "social" ? "SOCIALLY" : formData.marijuanaStatus.toUpperCase();
    } else if (formData.smokesWeed) {
      apiData.smokesWeed = formData.smokesWeed;
    }

    if (formData.alcoholStatus) {
      apiData.alcohol = formData.alcoholStatus.toUpperCase();
    } else if (formData.alcohol) {
      apiData.alcohol = formData.alcohol;
    }

    if (formData.hasPets) {
      if (formData.hasPets === "none") {
        apiData.petsOwned = [];
      } else {
        apiData.petsOwned = [formData.hasPets.toUpperCase()];
      }
    } else if (formData.petsOwned) {
      apiData.petsOwned = formData.petsOwned;
    }

    if (formData.acceptsPets) {
      apiData.petsOk = formData.acceptsPets.toUpperCase();
    } else if (formData.petsOk) {
      apiData.petsOk = formData.petsOk;
    }

    if (formData.tidinessLevel) {
      apiData.tidiness = formData.tidinessLevel.toUpperCase();
    } else if (formData.tidiness) {
      apiData.tidiness = formData.tidiness;
    }

    if (formData.socialLife) {
      apiData.guestsFreq = formData.socialLife.toUpperCase();
    } else if (formData.guestsFreq) {
      apiData.guestsFreq = formData.guestsFreq;
    }

    if (formData.sleepTime) {
      if (formData.sleepTime === "flexible") {
        apiData.schedule = Schedule.MIXED;
      } else if (formData.sleepTime === "early_bird") {
        apiData.schedule = Schedule.EARLY_BIRD;
      } else if (formData.sleepTime === "night_owl") {
        apiData.schedule = Schedule.NIGHT_OWL;
      } else {
        apiData.schedule = formData.sleepTime.toUpperCase() as Schedule;
      }
    } else if (formData.schedule) {
      apiData.schedule = formData.schedule;
    }

    // Campos adicionales que vienen del perfil completo (si existen en formData)
    const additionalFields = formData as any;
    if (additionalFields.cooking) {
      apiData.cooking = additionalFields.cooking;
    }
    if (additionalFields.diet) {
      apiData.diet = additionalFields.diet;
    }
    if (additionalFields.sharePolicy) {
      apiData.sharePolicy = additionalFields.sharePolicy;
    }
    if (additionalFields.interests) {
      apiData.interests = additionalFields.interests;
    }
    if (additionalFields.zodiacSign) {
      apiData.zodiacSign = additionalFields.zodiacSign;
    }
    if (additionalFields.musicUsage) {
      apiData.musicUsage = additionalFields.musicUsage;
    }
    if (additionalFields.quietHoursStart !== undefined) {
      apiData.quietHoursStart = additionalFields.quietHoursStart;
    }
    if (additionalFields.quietHoursEnd !== undefined) {
      apiData.quietHoursEnd = additionalFields.quietHoursEnd;
    }
    if (additionalFields.occupation !== undefined) {
      apiData.occupation = additionalFields.occupation;
    }
    if (additionalFields.education !== undefined) {
      apiData.education = additionalFields.education;
    }

    return apiData;
  }

  /**
   * Actualiza el perfil del usuario
   * Endpoint: PUT /api/profiles/me
   */
  async updateUserProfile(formData: Partial<UserProfileData>): Promise<User> {
    try {
      const apiData = this.mapFormDataToApiData(formData);

      const responseData = await apiPut<User>("/profiles/me", apiData);

      return responseData;
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
      throw error;
    }
  }
}

export default new UserProfileUpdateService();
