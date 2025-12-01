import type { SearchFilters, SearchFiltersFormData } from "../services/searchFiltersService";

/**
 * Adaptador para mapear datos de SearchFilters (API) a SearchFiltersFormData (Formulario)
 */
class SearchFiltersAdapter {
  /**
   * Mapea datos de la API a formato de formulario
   */
  mapApiToFormData(apiData: SearchFilters): SearchFiltersFormData {
    let preferredNeighborhoods: string[] = [];
    if ((apiData as any).preferredLocations && Array.isArray((apiData as any).preferredLocations)) {
      preferredNeighborhoods = (apiData as any).preferredLocations
        .map((location: any) => location?.neighborhood?.id)
        .filter((id: string) => id);
    }

    if (preferredNeighborhoods.length === 0 && apiData.preferredNeighborhoods) {
      if (Array.isArray(apiData.preferredNeighborhoods)) {
        if (apiData.preferredNeighborhoods.length > 0) {
          const firstItem = apiData.preferredNeighborhoods[0];
          if (
            typeof firstItem === "object" &&
            firstItem !== null &&
            "neighborhoodId" in firstItem
          ) {
            preferredNeighborhoods = apiData.preferredNeighborhoods
              .map((item: any) => item.neighborhoodId || item.id)
              .filter((id: string) => id);
          } else {
            // Si es array de strings
            preferredNeighborhoods = apiData.preferredNeighborhoods as string[];
          }
        }
      }
    }

    const result = {
      // Filtros de Ubicación
      mainPreferredNeighborhoodId: apiData.mainPreferredNeighborhoodId ?? "",
      preferredNeighborhoods,
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
}

export default new SearchFiltersAdapter();
