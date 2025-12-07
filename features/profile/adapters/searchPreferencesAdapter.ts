import { SearchPreferences, SearchPreferencesFormData } from "../interfaces";

/**
 * Adaptador para mapear datos de SearchPreferences (API) a SearchPreferencesFormData (Formulario)
 */
class SearchPreferencesAdapter {
  /**
   * Mapea datos de la API a formato de formulario
   */
  mapApiToFormData(apiData: SearchPreferences): SearchPreferencesFormData {
    return {
      // Filtros de Ubicación
      mainPreferredNeighborhoodId: apiData.mainPreferredNeighborhoodId ?? "",
      preferredLocations: apiData.preferredLocations ?? [],
      includeAdjacentNeighborhoods: apiData.includeAdjacentNeighborhoods ?? false,

      // Filtros Demográficos
      genderPref: apiData.genderPref ?? [],
      minAge: apiData.minAge ?? 18,
      maxAge: apiData.maxAge ?? 50,

      // Filtros Económicos
      budgetMin: apiData.budgetMin ?? 10000,
      budgetMax: apiData.budgetMax ?? 50000,

      // Filtros de Calidad
      onlyWithPhoto: apiData.onlyWithPhoto ?? true,
      lastActiveWithinDays: apiData.lastActiveWithinDays ?? 30,

      // Dealbreakers
      noCigarettes: apiData.noCigarettes ?? false,
      noWeed: apiData.noWeed ?? false,
      noPets: apiData.noPets ?? false,
      petsRequired: apiData.petsRequired ?? false,
      requireQuietHoursOverlap: apiData.requireQuietHoursOverlap ?? false,

      // Preferencias de compatibilidad
      tidinessMin: apiData.tidinessMin ?? "",
      schedulePref: apiData.schedulePref ?? "",
      guestsMax: apiData.guestsMax ?? "",
      musicMax: apiData.musicMax ?? "",

      // Arrays
      languagesPref: apiData.languagesPref ?? [],
      interestsPref: apiData.interestsPref ?? [],
      zodiacPref: apiData.zodiacPref ?? [],
    };
  }
}

export default new SearchPreferencesAdapter();
