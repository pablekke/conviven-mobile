import type {
  SearchFilters,
  SearchFiltersFormData,
  UpdateSearchFiltersRequest,
} from "../services/searchFiltersService";

/**
 * Adaptador para mapear datos entre SearchFilters (API) y SearchFiltersFormData (Formulario)
 */
class SearchFiltersAdapter {
  /**
   * Mapea datos de la API a formato de formulario
   */
  mapApiToFormData(apiData: SearchFilters): SearchFiltersFormData {
    let preferredLocations: string[] = [];

    if (apiData.preferredLocations && Array.isArray(apiData.preferredLocations)) {
      preferredLocations = apiData.preferredLocations
        .map(location => location?.neighborhood?.id)
        .filter((id): id is string => !!id && typeof id === "string");
    }

    // Extraer ID del barrio principal desde mainPreferredLocation
    const mainPreferredNeighborhoodId = apiData.mainPreferredLocation?.neighborhood?.id || "";

    const result = {
      // Filtros de Ubicación
      mainPreferredNeighborhoodId,
      preferredLocations,
      includeAdjacentNeighborhoods:
        apiData.includeAdjacentNeighborhoods !== undefined &&
        apiData.includeAdjacentNeighborhoods !== null
          ? apiData.includeAdjacentNeighborhoods
          : false,

      // Filtros Demográficos
      genderPref: apiData.genderPref ?? [],
      genders: apiData.genders ?? [],
      minAge: apiData.minAge ?? 18,
      maxAge: apiData.maxAge ?? 100,

      // Filtros Económicos
      budgetMin:
        apiData.budgetMin !== null && apiData.budgetMin !== undefined && apiData.budgetMin !== ""
          ? parseFloat(apiData.budgetMin as any)
          : 0,
      budgetMax:
        apiData.budgetMax !== null && apiData.budgetMax !== undefined && apiData.budgetMax !== ""
          ? parseFloat(apiData.budgetMax as any)
          : 100000,

      // Filtros de Calidad
      onlyWithPhoto: apiData.onlyWithPhoto ?? true,
    };
    return result;
  }

  /**
   * Mapea datos del formulario a formato de API para actualizar
   * El backend espera solo IDs (strings), no objetos completos
   */
  async mapFormDataToApi(formData: SearchFiltersFormData): Promise<UpdateSearchFiltersRequest> {
    return {
      // Filtros de Ubicación
      mainPreferredLocation: formData.mainPreferredNeighborhoodId,
      preferredLocations: formData.preferredLocations,
      includeAdjacentNeighborhoods: formData.includeAdjacentNeighborhoods,
      // Filtros Demográficos
      genderPref: formData.genderPref,
      genders: formData.genders,
      minAge: formData.minAge,
      maxAge: formData.maxAge,
      // Filtros Económicos
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      // Filtros de Calidad
      onlyWithPhoto: formData.onlyWithPhoto,
    };
  }
}

export default new SearchFiltersAdapter();
