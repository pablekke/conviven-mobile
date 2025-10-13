import { apiPut } from "../../../services/apiHelper";
import { UserProfileData } from "../interfaces";
import { User } from "../../../types/user";

class UserProfileUpdateService {
  private mapFormDataToApiData(formData: UserProfileData): any {
    const apiData: any = {};

    if (formData.bio !== undefined && formData.bio !== "") {
      apiData.bio = formData.bio;
    }

    if (formData.smokingStatus) {
      apiData.smokesCigarettes = formData.smokingStatus.toUpperCase();
    }

    if (formData.marijuanaStatus) {
      apiData.smokesWeed =
        formData.marijuanaStatus === "social" ? "SOCIALLY" : formData.marijuanaStatus.toUpperCase();
    }

    if (formData.alcoholStatus) {
      apiData.alcohol = formData.alcoholStatus.toUpperCase();
    }

    if (formData.hasPets) {
      if (formData.hasPets === "none") {
        apiData.petsOwned = [];
      } else {
        apiData.petsOwned = [formData.hasPets.toUpperCase()];
      }
    }

    if (formData.acceptsPets) {
      apiData.petsOk = formData.acceptsPets.toUpperCase();
    }

    if (formData.tidinessLevel) {
      apiData.tidiness = formData.tidinessLevel.toUpperCase();
    }

    if (formData.socialLife) {
      apiData.guestsFreq = formData.socialLife.toUpperCase();
    }

    if (formData.workSchedule) {
      apiData.schedule =
        formData.workSchedule === "flexible" ? "MIXED" : formData.workSchedule.toUpperCase();
    }

    if (formData.sleepTime) {
      apiData.schedule =
        formData.sleepTime === "flexible" ? "MIXED" : formData.sleepTime.toUpperCase();
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

    return apiData;
  }

  /**
   * Actualiza el perfil del usuario
   * Endpoint: PUT /api/profiles/me
   */
  async updateUserProfile(formData: UserProfileData): Promise<User> {
    try {
      console.log("📥 FormData recibido:", formData);
      const apiData = this.mapFormDataToApiData(formData);
      console.log("📤 Enviando a /profiles/me:", JSON.stringify(apiData, null, 2));

      const responseData = await apiPut<User>("/profiles/me", apiData);

      return responseData;
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
      throw error;
    }
  }
}

export default new UserProfileUpdateService();
