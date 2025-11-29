import type { SearchFilters, SearchFiltersFormData } from "../services/searchFiltersService";

/**
 * Adaptador para mapear datos de SearchFilters (API) a SearchFiltersFormData (Formulario)
 */
class SearchFiltersAdapter {
  /**
   * Mapea datos de la API a formato de formulario
   */
  mapApiToFormData(apiData: SearchFilters): SearchFiltersFormData {
    console.log("🔧 searchFiltersAdapter - API Data recibida:", JSON.stringify(apiData, null, 2));

    // Normalizar preferredNeighborhoods a array de strings
    let preferredNeighborhoods: string[] = [];
    if (apiData.preferredNeighborhoods) {
      if (Array.isArray(apiData.preferredNeighborhoods)) {
        // Si es array de objetos, extraer los IDs
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
      includeAdjacentNeighborhoods: apiData.includeAdjacentNeighborhoods ?? false,

      // Filtros Demográficos
      genderPref: apiData.genderPref ?? [],
      genders: apiData.genders ?? [],
      minAge: apiData.minAge ?? 18,
      maxAge: apiData.maxAge ?? 100,

      // Filtros Económicos
      budgetMin:
        apiData.budgetMin !== null && apiData.budgetMin !== undefined && apiData.budgetMin !== ""
          ? parseFloat(apiData.budgetMin)
          : 0,
      budgetMax:
        apiData.budgetMax !== null && apiData.budgetMax !== undefined && apiData.budgetMax !== ""
          ? parseFloat(apiData.budgetMax)
          : 100000,

      // Filtros de Calidad
      onlyWithPhoto: apiData.onlyWithPhoto ?? true,
    };

    console.log("✅ searchFiltersAdapter - Resultado mapeado:", JSON.stringify(result, null, 2));
    return result;
  }
}

export default new SearchFiltersAdapter();
