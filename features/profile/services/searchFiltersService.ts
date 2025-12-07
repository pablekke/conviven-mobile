import { BaseApiService } from "../../../services/apiHelper";

export interface SearchFilters {
  id: string;
  userId: string;
  // Filtros de Ubicación
  mainPreferredLocation?: {
    neighborhood?: { id: string; name: string };
    city?: { id: string; name: string };
    department?: { id: string; name: string };
  } | null;
  preferredLocations?:
    | {
        neighborhood?: { id: string; name: string };
        city?: { id: string; name: string };
        department?: { id: string; name: string };
      }[]
    | null;
  includeAdjacentNeighborhoods: boolean;
  // Filtros Demográficos
  genderPref: string[] | null;
  genders?: string[] | null;
  minAge: number | null;
  maxAge: number | null;
  // Filtros Económicos
  budgetMin: string | null;
  budgetMax: string | null;
  // Filtros de Calidad
  onlyWithPhoto: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSearchFiltersRequest {
  // Filtros de Ubicación
  mainPreferredLocation: string;
  preferredLocations: string[];
  includeAdjacentNeighborhoods: boolean;
  // Filtros Demográficos
  genderPref: string[];
  genders: string[];
  minAge: number;
  maxAge: number;
  // Filtros Económicos
  budgetMin: number;
  budgetMax: number;
  // Filtros de Calidad
  onlyWithPhoto: boolean;
}

export interface SearchFiltersFormData {
  // Filtros de Ubicación
  mainPreferredNeighborhoodId: string;
  preferredLocations: string[];
  includeAdjacentNeighborhoods: boolean;
  // Filtros Demográficos
  genderPref: string[];
  genders: string[];
  minAge: number;
  maxAge: number;
  // Filtros Económicos
  budgetMin: number;
  budgetMax: number;
  // Filtros de Calidad
  onlyWithPhoto: boolean;
}

class SearchFiltersService extends BaseApiService {
  constructor() {
    super("/search-filters");
  }

  async getSearchFilters(): Promise<SearchFilters> {
    return this.get<SearchFilters>("me");
  }

  async upsertSearchFilters(filters: UpdateSearchFiltersRequest): Promise<SearchFilters> {
    return this.put<SearchFilters>("me", filters);
  }

  async deleteSearchFilters(): Promise<void> {
    return this.delete<void>("me");
  }
}

const searchFiltersService = new SearchFiltersService();
export default searchFiltersService;
