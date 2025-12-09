import {
  RoommatePreferences,
  RoommatePreferencesFormData,
  CreateRoommatePreferencesRequest,
} from "../components/roommate/interfaces";

class RoommatePreferencesAdapter {
  mapApiToFormData(apiData: RoommatePreferences): RoommatePreferencesFormData {
    return {
      // Dealbreakers
      noCigarettes: apiData.noCigarettes ?? false,
      noWeed: apiData.noWeed ?? false,
      noPets: apiData.noPets ?? false,
      petsRequired: apiData.petsRequired ?? false,
      requireQuietHoursOverlap: apiData.requireQuietHoursOverlap ?? false,

      // Preferencias de Vibe
      tidinessMin: apiData.tidinessMin ?? "",
      schedulePref: apiData.schedulePref ?? "",
      guestsMax: apiData.guestsMax ?? "",
      musicMax: apiData.musicMax ?? "",

      // Nice-to-have
      languagesPref: apiData.languagesPref ?? [],
      interestsPref: apiData.interestsPref ?? [],
      zodiacPref: apiData.zodiacPref ?? [],

      // Calidad del Feed
      lastActiveWithinDays: apiData.lastActiveWithinDays ?? null,
    };
  }

  mapFormDataToApi(formData: RoommatePreferencesFormData): CreateRoommatePreferencesRequest {
    const request: CreateRoommatePreferencesRequest = {};

    // Dealbreakers - siempre enviar: true si está activo, null si está desactivado
    request.noCigarettes = formData.noCigarettes ? true : null;
    request.noWeed = formData.noWeed ? true : null;
    request.noPets = formData.noPets ? true : null;
    request.petsRequired = formData.petsRequired ? true : null;
    request.requireQuietHoursOverlap = formData.requireQuietHoursOverlap ? true : null;

    // Preferencias de Vibe - solo incluir si tienen valor (no vacío)
    if (formData.tidinessMin !== "") {
      request.tidinessMin = formData.tidinessMin as any;
    }
    if (formData.schedulePref !== "") {
      request.schedulePref = formData.schedulePref as any;
    }
    if (formData.guestsMax !== "") {
      request.guestsMax = formData.guestsMax as any;
    }
    if (formData.musicMax !== "") {
      request.musicMax = formData.musicMax as any;
    }

    // Nice-to-have - siempre enviar: array si tiene elementos, null si está vacío
    request.languagesPref = formData.languagesPref.length > 0 ? formData.languagesPref : null;
    request.interestsPref = formData.interestsPref.length > 0 ? formData.interestsPref : null;
    request.zodiacPref = formData.zodiacPref.length > 0 ? formData.zodiacPref : null;

    // Calidad del Feed
    if (formData.lastActiveWithinDays !== null && formData.lastActiveWithinDays !== undefined) {
      request.lastActiveWithinDays = formData.lastActiveWithinDays;
    }

    return request;
  }
}

export default new RoommatePreferencesAdapter();
